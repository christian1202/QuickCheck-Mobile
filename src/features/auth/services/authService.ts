// ============================================================
// QuickCheck — Auth Service (Google SSO)
// ============================================================
// Authenticates users via Google Single Sign-On (Mocked for now).
// Sessions persisted via expo-secure-store.
// ============================================================

import type { IAuthService } from '../../../core/di/container';
import { database, usersCollection } from '../../../core/database';
import { Q } from '@nozbe/watermelondb';

let SecureStore: typeof import('expo-secure-store') | null = null;
const SESSION_KEY = 'quickcheck_session_user_id';
const FIRST_RUN_KEY = 'quickcheck_first_run_done';

// ─── Lazy Imports ───────────────────────────────

async function getSecureStore() {
  if (!SecureStore) SecureStore = await import('expo-secure-store');
  return SecureStore;
}

// ─── Session Persistence ────────────────────────

async function saveSession(userId: string): Promise<void> {
  (await getSecureStore()).setItemAsync(SESSION_KEY, userId);
}
async function clearSession(): Promise<void> {
  (await getSecureStore()).deleteItemAsync(SESSION_KEY).catch(() => {});
}
async function getSavedSession(): Promise<string | null> {
  return (await getSecureStore()).getItemAsync(SESSION_KEY).catch(() => null);
}

// ─── First Run ──────────────────────────────────

async function isFirstRun(): Promise<boolean> {
  const result = await (await getSecureStore()).getItemAsync(FIRST_RUN_KEY).catch(() => null);
  return result !== 'true';
}
async function markFirstRunDone(): Promise<void> {
  (await getSecureStore()).setItemAsync(FIRST_RUN_KEY, 'true');
}

// ─── User Record ────────────────────────────────

interface LocalUserRecord {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}

// ─── User Lookup ────────────────────────────────

async function findUserByEmail(email: string): Promise<LocalUserRecord | null> {
  const n = email.toLowerCase().trim();
  const users = await usersCollection.query(Q.where('email', n)).fetch();
  if (users.length === 0) return null;
  const m = users[0];
  return {
    id: m.id,
    email: (m as any).email,
    fullName: (m as any).fullName ?? null,
    role: (m as any).role ?? 'admin',
  };
}

async function getSessionUser(): Promise<LocalUserRecord | null> {
  const sid = await getSavedSession();
  if (!sid) return null;
  try {
    const u = await usersCollection.find(sid);
    return {
      id: u.id,
      email: (u as any).email ?? '',
      fullName: (u as any).fullName ?? null,
      role: (u as any).role ?? 'admin',
    };
  } catch {
    await clearSession();
    return null;
  }
}

// ─── Public Auth API ────────────────────────────

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

try {
  if (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  } else {
    console.warn('Google Web Client ID is missing. Google Sign-In will not work.');
  }
} catch (e) {
  console.warn('GoogleSignin configure failed. Are you running in Expo Go without a custom dev client?', e);
}

export async function loginWithGoogle(): Promise<LocalUserRecord> {
  try {
    if (!GoogleSignin || !GoogleSignin.hasPlayServices) {
      throw new Error('Google Sign-In is not supported in this environment (Expo Go). Please rebuild with a Custom Dev Client.');
    }
    
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    console.log('Google Signin Response:', JSON.stringify(userInfo));
    
    let email = '';
    let name = 'Google User';

    if (userInfo && typeof userInfo === 'object') {
      if ('type' in userInfo) {
        if (userInfo.type === 'cancelled') {
          throw new Error('Google Sign-In was cancelled.');
        }
        if (userInfo.type === 'success' && userInfo.data) {
          email = userInfo.data.user?.email || '';
          name = userInfo.data.user?.name || 'Google User';
        }
      } else {
        // Fallback for older versions
        email = (userInfo as any).user?.email || (userInfo as any).email || '';
        name = (userInfo as any).user?.name || (userInfo as any).name || 'Google User';
      }
    }

    if (!email) {
      throw new Error('Could not retrieve email from Google Sign-In.');
    }

    let user = await findUserByEmail(email);
    
    if (!user) {
      let createdId = '';
      await database.write(async () => {
        const newUser = await usersCollection.create((u: any) => {
          u.email = email;
          u.fullName = name;
          u.role = 'admin';
          u._raw.password_hash = 'google_sso';
          u._raw.local_id = null;
        });
        createdId = newUser.id;
      });
      const created = await usersCollection.find(createdId);
      user = {
        id: created.id,
        email: (created as any).email,
        fullName: (created as any).fullName,
        role: (created as any).role,
      };
    }
    
    await saveSession(user.id);
    await markFirstRunDone();
    return user;
  } catch (error: any) {
    if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
      throw new Error('Google Sign-In was cancelled.');
    } else if (error.code === statusCodes?.IN_PROGRESS) {
      throw new Error('Google Sign-In is already in progress.');
    } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services are not available on this device.');
    } else {
      throw error;
    }
  }
}

export async function logoutUser(): Promise<void> {
  try {
    if (GoogleSignin && GoogleSignin.signOut) {
      await GoogleSignin.signOut();
    }
  } catch (error) {
    console.error('Google Sign-Out failed', error);
  }
  await clearSession();
}

export async function getCurrentUser(): Promise<{
  id: string; email: string; role: string; fullName: string | null;
} | null> {
  const u = await getSessionUser();
  return u ? { id: u.id, email: u.email, role: u.role, fullName: u.fullName } : null;
}

// ─── DI Adapter ─────────────────────────────────

export function createAuthService(): IAuthService {
  return {
    loginWithGoogle: async () => {
      const u = await loginWithGoogle();
      return { id: u.id, email: u.email, role: u.role, fullName: u.fullName || '' };
    },
    logout: async () => {
      await logoutUser();
    },
    getCurrentUser: async () => {
      const u = await getCurrentUser();
      return u ? { id: u.id, email: u.email, role: u.role, fullName: u.fullName } : null;
    },
    isAuthenticated: async () => (await getSavedSession()) !== null,
    isFirstRun: async () => isFirstRun(),
  };
}