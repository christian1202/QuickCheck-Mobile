// ============================================================
// QuickCheck — Export Store (Zustand)
// ============================================================
// Tracks export state: Google Sheets connection, export progress,
// linked spreadsheet info, and auto-save status.
//
// Usage:
//   const { isExporting, exportMembers, connectGoogle } = useExportStore();
// ============================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GoogleSheetsServiceInterface } from '../services/googleSheetsService';
import type { AutoSaveServiceInterface } from '../../../core/services/autoSaveService';
import { logger } from '../../../core/logging/logger';

// ─── State Shape ───────────────────────────────────────────

export interface ExportState {
  // Google Sheets connection
  isGoogleConnected: boolean;
  isConnecting: boolean;

  // Linked spreadsheet
  linkedSpreadsheetId: string | null;
  linkedSpreadsheetName: string | null;

  // Export progress
  isExporting: boolean;
  lastExportTime: string | null;
  exportError: string | null;
  exportProgress: string | null; // e.g. "Exporting members..."

  // Auto-save
  autoSaveEnabled: boolean;
  autoSaveGoogleSheets: boolean;

  // ── Actions ─────────────────────────────────────────────

  // Google Sheets connection
  checkConnection: (sheetsService: GoogleSheetsServiceInterface) => Promise<void>;
  connectGoogle: (sheetsService: GoogleSheetsServiceInterface) => Promise<boolean>;
  disconnectGoogle: (sheetsService: GoogleSheetsServiceInterface) => Promise<void>;

  // Spreadsheet management
  linkSpreadsheet: (sheetsService: GoogleSheetsServiceInterface, spreadsheetId: string) => Promise<void>;
  createAndLinkSpreadsheet: (sheetsService: GoogleSheetsServiceInterface, title: string) => Promise<void>;
  loadLinkedSpreadsheet: (sheetsService: GoogleSheetsServiceInterface) => Promise<void>;

  // Export operations
  exportMembers: (sheetsService: GoogleSheetsServiceInterface, spreadsheetId: string) => Promise<void>;
  exportAttendance: (sheetsService: GoogleSheetsServiceInterface, spreadsheetId: string, eventId?: string) => Promise<void>;
  exportEvents: (sheetsService: GoogleSheetsServiceInterface, spreadsheetId: string) => Promise<void>;
  exportAll: (sheetsService: GoogleSheetsServiceInterface, spreadsheetId: string) => Promise<void>;

  // Auto-save
  toggleAutoSave: (autoSaveService: AutoSaveServiceInterface) => void;
  toggleAutoSaveGoogleSheets: () => void;
  setAutoSaveGoogleSheets: (enabled: boolean) => void;

  // Utils
  reset: () => void;
}

// ─── Initial State ─────────────────────────────────────────

const initialState = {
  isGoogleConnected: false,
  isConnecting: false,
  linkedSpreadsheetId: null as string | null,
  linkedSpreadsheetName: null as string | null,
  isExporting: false,
  lastExportTime: null as string | null,
  exportError: null as string | null,
  exportProgress: null as string | null,
  autoSaveEnabled: false,
  autoSaveGoogleSheets: false,
};

// ─── Store ─────────────────────────────────────────────────

export const useExportStore = create<ExportState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ── Connection ────────────────────────────────────

        checkConnection: async (sheetsService: GoogleSheetsServiceInterface) => {
          try {
            const connected = await sheetsService.isConnected();
            set({ isGoogleConnected: connected });
          } catch {
            set({ isGoogleConnected: false });
          }
        },

        connectGoogle: async (sheetsService: GoogleSheetsServiceInterface) => {
          set({ isConnecting: true, exportError: null });
          try {
            const success = await sheetsService.connect();
            if (success) {
              set({ isGoogleConnected: true, isConnecting: false });
              logger.info('ExportStore', 'Google connected successfully');
            } else {
              set({
                isGoogleConnected: false,
                isConnecting: false,
                exportError: 'Google sign-in was cancelled or failed.',
              });
            }
            return success;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to connect to Google';
            set({
              isGoogleConnected: false,
              isConnecting: false,
              exportError: message,
            });
            logger.error('ExportStore', 'Google connect failed', error instanceof Error ? error : undefined);
            return false;
          }
        },

        disconnectGoogle: async (sheetsService: GoogleSheetsServiceInterface) => {
          try {
            await sheetsService.disconnect();
            set({
              isGoogleConnected: false,
              linkedSpreadsheetId: null,
              linkedSpreadsheetName: null,
            });
            logger.info('ExportStore', 'Google disconnected');
          } catch (error) {
            logger.error('ExportStore', 'Google disconnect failed', error instanceof Error ? error : undefined);
          }
        },

        // ── Spreadsheet ───────────────────────────────────

        linkSpreadsheet: async (sheetsService: GoogleSheetsServiceInterface, spreadsheetId: string) => {
          set({ exportError: null });
          try {
            await sheetsService.linkSpreadsheet(spreadsheetId);
            const name = await sheetsService.getLinkedSpreadsheetName();
            set({
              linkedSpreadsheetId: spreadsheetId,
              linkedSpreadsheetName: name || spreadsheetId,
            });
            logger.info('ExportStore', 'Spreadsheet linked', { id: spreadsheetId, name });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to link spreadsheet';
            set({ exportError: message });
            logger.error('ExportStore', 'Link spreadsheet failed', error instanceof Error ? error : undefined);
          }
        },

        createAndLinkSpreadsheet: async (sheetsService: GoogleSheetsServiceInterface, title: string) => {
          set({ isExporting: true, exportError: null, exportProgress: 'Creating spreadsheet...' });
          try {
            const spreadsheetId = await sheetsService.createSpreadsheet(title);
            await sheetsService.linkSpreadsheet(spreadsheetId);
            const name = await sheetsService.getLinkedSpreadsheetName();
            set({
              linkedSpreadsheetId: spreadsheetId,
              linkedSpreadsheetName: name || title,
              isExporting: false,
              exportProgress: null,
            });
            logger.info('ExportStore', 'Created and linked spreadsheet', { id: spreadsheetId });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create spreadsheet';
            set({ exportError: message, isExporting: false, exportProgress: null });
            logger.error('ExportStore', 'Create spreadsheet failed', error instanceof Error ? error : undefined);
            throw error;
          }
        },

        loadLinkedSpreadsheet: async (sheetsService: GoogleSheetsServiceInterface) => {
          try {
            const id = await sheetsService.getLinkedSpreadsheetId();
            const name = await sheetsService.getLinkedSpreadsheetName();
            set({
              linkedSpreadsheetId: id,
              linkedSpreadsheetName: name,
            });
          } catch {
            // Silently fail - spreadsheet not linked yet
          }
        },

        // ── Export ────────────────────────────────────────

        exportMembers: async (sheetsService: GoogleSheetsServiceInterface, spreadsheetId: string) => {
          set({ isExporting: true, exportError: null, exportProgress: 'Exporting members...' });
          try {
            await sheetsService.exportMembersToSheet(spreadsheetId);
            const now = new Date().toISOString();
            set({
              isExporting: false,
              lastExportTime: now,
              exportProgress: null,
              exportError: null,
            });
            logger.info('ExportStore', 'Members exported successfully');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Export failed';
            set({ exportError: message, isExporting: false, exportProgress: null });
            logger.error('ExportStore', 'Members export failed', error instanceof Error ? error : undefined);
            throw error;
          }
        },

        exportAttendance: async (sheetsService: GoogleSheetsServiceInterface, spreadsheetId: string, eventId?: string) => {
          set({ isExporting: true, exportError: null, exportProgress: 'Exporting attendance...' });
          try {
            await sheetsService.exportAttendanceToSheet(spreadsheetId, eventId);
            const now = new Date().toISOString();
            set({
              isExporting: false,
              lastExportTime: now,
              exportProgress: null,
              exportError: null,
            });
            logger.info('ExportStore', 'Attendance exported successfully');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Export failed';
            set({ exportError: message, isExporting: false, exportProgress: null });
            logger.error('ExportStore', 'Attendance export failed', error instanceof Error ? error : undefined);
            throw error;
          }
        },

        exportEvents: async (sheetsService: GoogleSheetsServiceInterface, spreadsheetId: string) => {
          set({ isExporting: true, exportError: null, exportProgress: 'Exporting events...' });
          try {
            await sheetsService.exportEventsToSheet(spreadsheetId);
            const now = new Date().toISOString();
            set({
              isExporting: false,
              lastExportTime: now,
              exportProgress: null,
              exportError: null,
            });
            logger.info('ExportStore', 'Events exported successfully');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Export failed';
            set({ exportError: message, isExporting: false, exportProgress: null });
            logger.error('ExportStore', 'Events export failed', error instanceof Error ? error : undefined);
            throw error;
          }
        },

        exportAll: async (sheetsService: GoogleSheetsServiceInterface, spreadsheetId: string) => {
          set({ isExporting: true, exportError: null, exportProgress: 'Exporting all data...' });
          try {
            await sheetsService.exportAllToSheet(spreadsheetId);
            const now = new Date().toISOString();
            set({
              isExporting: false,
              lastExportTime: now,
              exportProgress: null,
              exportError: null,
            });
            logger.info('ExportStore', 'All data exported successfully');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Export failed';
            set({ exportError: message, isExporting: false, exportProgress: null });
            logger.error('ExportStore', 'Export all failed', error instanceof Error ? error : undefined);
            throw error;
          }
        },

        // ── Auto-Save ─────────────────────────────────────

        toggleAutoSave: (autoSaveService: AutoSaveServiceInterface) => {
          const currentlyEnabled = get().autoSaveEnabled;
          if (currentlyEnabled) {
            autoSaveService.disable();
            set({ autoSaveEnabled: false });
          } else {
            autoSaveService.enable();
            set({ autoSaveEnabled: true });
          }
        },

        toggleAutoSaveGoogleSheets: () => {
          set((state) => ({ autoSaveGoogleSheets: !state.autoSaveGoogleSheets }));
        },

        setAutoSaveGoogleSheets: (enabled: boolean) => {
          set({ autoSaveGoogleSheets: enabled });
        },

        // ── Reset ─────────────────────────────────────────

        reset: () => set(initialState),
      }),
      {
        name: 'export-store',
        partialize: (state) => ({
          linkedSpreadsheetId: state.linkedSpreadsheetId,
          linkedSpreadsheetName: state.linkedSpreadsheetName,
          lastExportTime: state.lastExportTime,
          autoSaveEnabled: state.autoSaveEnabled,
          autoSaveGoogleSheets: state.autoSaveGoogleSheets,
        }),
      },
    ),
    { name: 'export-store' },
  ),
);