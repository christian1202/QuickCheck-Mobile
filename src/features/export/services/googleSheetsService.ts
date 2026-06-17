// ============================================================
// QuickCheck — Google Sheets Service
// ============================================================
// Handles OAuth 2.0 authentication with Google and data export
// to Google Sheets via the Sheets API v4 (REST).
//
// Features:
//   - OAuth 2.0 via expo-auth-session
//   - Token persistence in expo-secure-store
//   - Export members, attendance records, and events
//   - Create new spreadsheets or link existing ones
//
// Usage:
//   const sheets = createGoogleSheetsService();
//   await sheets.connect();
//   await sheets.exportMembersToSheet(spreadsheetId);
// ============================================================

import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { database, membersCollection, attendanceRecordsCollection, eventsCollection } from '../../../core/database';
import { logger } from '../../../core/logging/logger';
import { Q } from '@nozbe/watermelondb';

// ─── Constants ───────────────────────────────────────────────

const GOOGLE_OAUTH_CONFIG = {
  // These are generic Expo/development client IDs.
  // For production, replace with your own Google Cloud Console credentials.
  clientId: 'CHANGEME_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  // Redirect URI — Expo auto-generates this
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'quickcheck',
    path: 'oauth/google',
  }),
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
};

const STORAGE_KEYS = {
  accessToken: 'google_sheets_access_token',
  refreshToken: 'google_sheets_refresh_token',
  tokenExpiry: 'google_sheets_token_expiry',
  linkedSpreadsheetId: 'google_sheets_linked_id',
  linkedSpreadsheetName: 'google_sheets_linked_name',
};

const GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const GOOGLE_TOKEN_API = 'https://oauth2.googleapis.com/token';

// ─── Types ───────────────────────────────────────────────────

interface GoogleTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number; // epoch ms
}

interface SheetHeader {
  key: string;
  label: string;
}

// ─── Token Management ────────────────────────────────────────

async function getStoredTokens(): Promise<GoogleTokens | null> {
  try {
    const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
    const expiryStr = await SecureStore.getItemAsync(STORAGE_KEYS.tokenExpiry);

    if (!accessToken) return null;

    return {
      accessToken,
      refreshToken: refreshToken || null,
      expiresAt: expiryStr ? parseInt(expiryStr, 10) : 0,
    };
  } catch (error) {
    logger.error('GoogleSheets', 'Failed to read stored tokens', error instanceof Error ? error : undefined);
    return null;
  }
}

async function storeTokens(tokens: GoogleTokens): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.accessToken, tokens.accessToken);
    if (tokens.refreshToken) {
      await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    }
    await SecureStore.setItemAsync(STORAGE_KEYS.tokenExpiry, String(tokens.expiresAt));
  } catch (error) {
    logger.error('GoogleSheets', 'Failed to store tokens', error instanceof Error ? error : undefined);
  }
}

async function clearStoredTokens(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken).catch(() => {}),
      SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken).catch(() => {}),
      SecureStore.deleteItemAsync(STORAGE_KEYS.tokenExpiry).catch(() => {}),
    ]);
  } catch {
    // Silently ignore
  }
}

async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens | null> {
  try {
    const response = await fetch(GOOGLE_TOKEN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) {
      logger.error('GoogleSheets', 'Token refresh failed', new Error(`HTTP ${response.status}`));
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };
  } catch (error) {
    logger.error('GoogleSheets', 'Token refresh network error', error instanceof Error ? error : undefined);
    return null;
  }
}

async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getStoredTokens();
  if (!tokens) return null;

  // Check if token is still valid (with 60s buffer)
  if (Date.now() < tokens.expiresAt - 60_000) {
    return tokens.accessToken;
  }

  // Try to refresh
  if (tokens.refreshToken) {
    const newTokens = await refreshAccessToken(tokens.refreshToken);
    if (newTokens) {
      await storeTokens(newTokens);
      return newTokens.accessToken;
    }
  }

  // Token expired and can't refresh — user needs to re-authenticate
  await clearStoredTokens();
  return null;
}

// ─── OAuth Flow ──────────────────────────────────────────────

let discoveryDocument: AuthSession.DiscoveryDocument | null = null;

async function getDiscoveryDocument(): Promise<AuthSession.DiscoveryDocument> {
  if (!discoveryDocument) {
    discoveryDocument = await AuthSession.fetchDiscoveryAsync(
      'https://accounts.google.com'
    );
  }
  return discoveryDocument;
}

async function performOAuthFlow(): Promise<GoogleTokens | null> {
  try {
    const discovery = await getDiscoveryDocument();
    if (!discovery.authorizationEndpoint || !discovery.tokenEndpoint) {
      throw new Error('Failed to fetch Google OAuth discovery document');
    }

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_OAUTH_CONFIG.clientId,
      redirectUri: GOOGLE_OAUTH_CONFIG.redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: GOOGLE_OAUTH_CONFIG.scopes,
      usePKCE: true,
    });

    const result = await request.promptAsync(discovery);

    if (result.type !== 'success' || !result.params.code) {
      logger.info('GoogleSheets', 'OAuth flow aborted or failed', { type: result.type });
      return null;
    }

    // Exchange auth code for tokens
    const tokenResponse = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        code: result.params.code,
        redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
        grant_type: 'authorization_code',
        code_verifier: request.codeVerifier || '',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      logger.error('GoogleSheets', 'Token exchange failed', new Error(errText));
      return null;
    }

    const tokenData = await tokenResponse.json();

    const tokens: GoogleTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
    };

    await storeTokens(tokens);
    logger.info('GoogleSheets', 'OAuth flow completed successfully');

    return tokens;
  } catch (error) {
    logger.error('GoogleSheets', 'OAuth flow error', error instanceof Error ? error : undefined);
    return null;
  }
}

// ─── API Helpers ─────────────────────────────────────────────

async function googleApiRequest(
  url: string,
  options: RequestInit = {}
): Promise<unknown> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated with Google. Please connect your account.');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    // Token may have expired — clear and ask for re-auth
    await clearStoredTokens();
    throw new Error('Google session expired. Please reconnect your account.');
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google API error (${response.status}): ${errText}`);
  }

  return response.json();
}

// ─── Data Extraction ─────────────────────────────────────────

async function getAllMembers(): Promise<
  Array<{ fullName: string; role: string | null; ministryGroup: string | null; status: string; memberSince: string | null; attendanceRate: number }>
> {
  const members = await membersCollection.query().fetch();

  const attendanceSummaries = await database.get('attendance_summary').query().fetch();

  return members.map((member: any) => {
    const summary = attendanceSummaries.find((s: any) => s.memberId === member.id || s.member_id === member.id);
    return {
      fullName: member.fullName || '',
      role: member.roleInChurch || '',
      ministryGroup: member.ministryGroupId || '',
      status: member.status || '',
      memberSince: member.memberSince || '',
      attendanceRate: summary ? ((summary as any).attendanceRate ?? (summary as any).attendance_rate ?? 0) : 0,
    };
  });
}

async function getAllAttendance(eventId?: string): Promise<
  Array<{ memberName: string; eventName: string; date: string; status: string; minutesLate: number | null }>
> {
  const conditions: Q.Clause[] = [];
  if (eventId) {
    conditions.push(Q.where('event_id', eventId));
  }
  const records = await attendanceRecordsCollection.query(...conditions).fetch();

  const result: Array<{
    memberName: string;
    eventName: string;
    date: string;
    status: string;
    minutesLate: number | null;
  }> = [];

  for (const record of records) {
    const r = record as any;
    let memberName = r.memberId;
    let eventName = r.eventId;
    let eventDate = '';

    try {
      const member = await membersCollection.find(r.memberId);
      memberName = (member as any).fullName || r.memberId;
    } catch {
      // Member may have been deleted
    }

    try {
      const event = await eventsCollection.find(r.eventId);
      eventName = (event as any).name || r.eventId;
      eventDate = (event as any).date || '';
    } catch {
      // Event may have been deleted
    }

    result.push({
      memberName,
      eventName,
      date: eventDate,
      status: r.status || '',
      minutesLate: r.minutesLate ?? null,
    });
  }

  return result;
}

async function getAllEvents(): Promise<
  Array<{ name: string; type: string; date: string; location: string | null; isRecurring: boolean }>
> {
  const events = await eventsCollection.query().fetch();
  return events.map((event: any) => ({
    name: event.name || '',
    type: event.eventType || '',
    date: event.date || '',
    location: event.location || null,
    isRecurring: event.isRecurring || false,
  }));
}

// ─── Google Sheets Operations ────────────────────────────────

async function ensureSheetHeaders(
  spreadsheetId: string,
  sheetName: string,
  headers: string[]
): Promise<void> {
  try {
    // Check if headers already exist
    const response = await googleApiRequest(
      `${GOOGLE_SHEETS_API}/${spreadsheetId}/values/'${sheetName}'!A1:Z1`
    ) as { values?: string[][] };

    const existingHeaders = response.values?.[0] || [];
    const needsHeaders =
      existingHeaders.length === 0 ||
      !headers.every((h, i) => existingHeaders[i] === h);

    if (needsHeaders) {
      await googleApiRequest(
        `${GOOGLE_SHEETS_API}/${spreadsheetId}/values/'${sheetName}'!A1?valueInputOption=RAW`,
        {
          method: 'PUT',
          body: JSON.stringify({
            range: `'${sheetName}'!A1`,
            values: [headers],
          }),
        }
      );
    }
  } catch {
    // Sheet may not exist — create it with headers
    await googleApiRequest(
      `${GOOGLE_SHEETS_API}/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        }),
      }
    );

    await googleApiRequest(
      `${GOOGLE_SHEETS_API}/${spreadsheetId}/values/'${sheetName}'!A1?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({
          range: `'${sheetName}'!A1`,
          values: [headers],
        }),
      }
    );
  }
}

async function appendDataToSheet(
  spreadsheetId: string,
  sheetName: string,
  rows: string[][]
): Promise<void> {
  if (rows.length === 0) return;

  await googleApiRequest(
    `${GOOGLE_SHEETS_API}/${spreadsheetId}/values/'${sheetName}'!A1:append?valueInputOption=RAW&insertDataOption=OVERWRITE`,
    {
      method: 'POST',
      body: JSON.stringify({
        values: rows,
      }),
    }
  );
}

async function clearSheetData(
  spreadsheetId: string,
  sheetName: string
): Promise<void> {
  try {
    // Get the range that has data
    const response = await googleApiRequest(
      `${GOOGLE_SHEETS_API}/${spreadsheetId}/values/'${sheetName}'`
    ) as { values?: unknown[][] };

    if (response.values && response.values.length > 1) {
      // Clear everything except header row
      const range = `'${sheetName}'!A2:Z${response.values.length}`;
      await googleApiRequest(
        `${GOOGLE_SHEETS_API}/${spreadsheetId}/values/${range}:clear`,
        { method: 'POST' }
      );
    }
  } catch {
    // Sheet might not exist or be empty
  }
}

// ─── Public API ──────────────────────────────────────────────

export interface GoogleSheetsServiceInterface {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  exportMembersToSheet(spreadsheetId: string): Promise<void>;
  exportAttendanceToSheet(spreadsheetId: string, eventId?: string): Promise<void>;
  exportEventsToSheet(spreadsheetId: string): Promise<void>;
  exportAllToSheet(spreadsheetId: string): Promise<void>;
  createSpreadsheet(title: string): Promise<string>;
  linkSpreadsheet(spreadsheetId: string): Promise<void>;
  getLinkedSpreadsheetId(): Promise<string | null>;
  getLinkedSpreadsheetName(): Promise<string | null>;
}

export function createGoogleSheetsService(): GoogleSheetsServiceInterface {
  return {
    // ── Authentication ────────────────────────────────────

    async connect(): Promise<boolean> {
      logger.info('GoogleSheets', 'Starting OAuth connect flow');

      // Check if already connected with valid token
      const existingToken = await getValidAccessToken();
      if (existingToken) {
        logger.info('GoogleSheets', 'Already connected');
        return true;
      }

      // Perform OAuth flow
      const tokens = await performOAuthFlow();
      if (!tokens) {
        logger.info('GoogleSheets', 'OAuth flow did not return tokens');
        return false;
      }

      logger.info('GoogleSheets', 'Successfully connected to Google');
      return true;
    },

    async disconnect(): Promise<void> {
      logger.info('GoogleSheets', 'Disconnecting from Google');
      await clearStoredTokens();
    },

    async isConnected(): Promise<boolean> {
      const token = await getValidAccessToken();
      return token !== null;
    },

    // ── Export Members ────────────────────────────────────

    async exportMembersToSheet(spreadsheetId: string): Promise<void> {
      logger.info('GoogleSheets', 'Exporting members to sheet', { spreadsheetId });

      const members = await getAllMembers();
      const headers = [
        'Full Name', 'Role in Church', 'Ministry Group',
        'Status', 'Member Since', 'Attendance Rate (%)',
      ];

      await ensureSheetHeaders(spreadsheetId, 'Members', headers);
      await clearSheetData(spreadsheetId, 'Members');

      const rows = members.map((m) => [
        m.fullName,
        m.role || '',
        m.ministryGroup || '',
        m.status,
        m.memberSince || '',
        String(m.attendanceRate),
      ]);

      await appendDataToSheet(spreadsheetId, 'Members', rows);
      logger.info('GoogleSheets', 'Members export complete', { count: rows.length });
    },

    // ── Export Attendance ─────────────────────────────────

    async exportAttendanceToSheet(spreadsheetId: string, eventId?: string): Promise<void> {
      logger.info('GoogleSheets', 'Exporting attendance to sheet', { spreadsheetId, eventId });

      const records = await getAllAttendance(eventId);
      const headers = [
        'Member', 'Event', 'Date', 'Status', 'Minutes Late',
      ];

      await ensureSheetHeaders(spreadsheetId, 'Attendance', headers);
      await clearSheetData(spreadsheetId, 'Attendance');

      const rows = records.map((r) => [
        r.memberName,
        r.eventName,
        r.date,
        r.status,
        r.minutesLate !== null ? String(r.minutesLate) : '',
      ]);

      await appendDataToSheet(spreadsheetId, 'Attendance', rows);
      logger.info('GoogleSheets', 'Attendance export complete', { count: rows.length });
    },

    // ── Export Events ─────────────────────────────────────

    async exportEventsToSheet(spreadsheetId: string): Promise<void> {
      logger.info('GoogleSheets', 'Exporting events to sheet', { spreadsheetId });

      const events = await getAllEvents();
      const headers = [
        'Event Name', 'Type', 'Date', 'Location', 'Recurring',
      ];

      await ensureSheetHeaders(spreadsheetId, 'Events', headers);
      await clearSheetData(spreadsheetId, 'Events');

      const rows = events.map((e) => [
        e.name,
        e.type,
        e.date,
        e.location || '',
        e.isRecurring ? 'Yes' : 'No',
      ]);

      await appendDataToSheet(spreadsheetId, 'Events', rows);
      logger.info('GoogleSheets', 'Events export complete', { count: rows.length });
    },

    // ── Export All ────────────────────────────────────────

    async exportAllToSheet(spreadsheetId: string): Promise<void> {
      logger.info('GoogleSheets', 'Exporting all data to sheet', { spreadsheetId });
      await this.exportMembersToSheet(spreadsheetId);
      await this.exportAttendanceToSheet(spreadsheetId);
      await this.exportEventsToSheet(spreadsheetId);
      logger.info('GoogleSheets', 'All data export complete');
    },

    // ── Create Spreadsheet ────────────────────────────────

    async createSpreadsheet(title: string): Promise<string> {
      logger.info('GoogleSheets', 'Creating new spreadsheet', { title });

      const response = await googleApiRequest(
        GOOGLE_SHEETS_API,
        {
          method: 'POST',
          body: JSON.stringify({
            properties: { title },
          }),
        }
      ) as { spreadsheetId: string; spreadsheetUrl?: string };

      logger.info('GoogleSheets', 'Spreadsheet created', { id: response.spreadsheetId });
      return response.spreadsheetId;
    },

    // ── Link Spreadsheet ──────────────────────────────────

    async linkSpreadsheet(spreadsheetId: string): Promise<void> {
      logger.info('GoogleSheets', 'Linking spreadsheet', { spreadsheetId });

      // Get spreadsheet metadata to get the name
      try {
        const response = await googleApiRequest(
          `${GOOGLE_SHEETS_API}/${spreadsheetId}?fields=properties.title`
        ) as { properties: { title: string } };

        const name = response.properties?.title || spreadsheetId;
        await SecureStore.setItemAsync(STORAGE_KEYS.linkedSpreadsheetId, spreadsheetId);
        await SecureStore.setItemAsync(STORAGE_KEYS.linkedSpreadsheetName, name);
        logger.info('GoogleSheets', 'Spreadsheet linked', { id: spreadsheetId, name });
      } catch {
        // Just store the ID if we can't get metadata
        await SecureStore.setItemAsync(STORAGE_KEYS.linkedSpreadsheetId, spreadsheetId);
        await SecureStore.setItemAsync(STORAGE_KEYS.linkedSpreadsheetName, spreadsheetId);
      }
    },

    async getLinkedSpreadsheetId(): Promise<string | null> {
      return SecureStore.getItemAsync(STORAGE_KEYS.linkedSpreadsheetId).catch(() => null);
    },

    async getLinkedSpreadsheetName(): Promise<string | null> {
      return SecureStore.getItemAsync(STORAGE_KEYS.linkedSpreadsheetName).catch(() => null);
    },
  };
}