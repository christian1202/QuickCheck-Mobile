// ============================================================
// QuickCheck — Local Authentication Service
// ============================================================
// Pure local auth: email + password stored in WatermelonDB.
// Passwords hashed with bcryptjs. Session persisted via
// expo-secure-store (encrypted device keychain).
// No cloud dependency. No network required.
// ============================================================

import type { IAuthService } from '../../../core/di/container';
import { database, usersCollection } from '../../../core/database';

let bcrypt: typeof import('bcryptjs') | null = null;
let SecureStore: typeof import('expo-secure-store') | null = null;
const SESSION_KEY = 'quickcheck_session_user_id';
const FIRST_RUN_KEY = 'quickcheck_first_run_done';

// ─── Lazy Imports ───────────────────────────────

async function getBcrypt() {
  if (!bcrypt) bcrypt = await import('bcryptjs');
  return bcrypt;
}
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
  localId: string | null;
  passwordHash: string;
}

// ─── User Lookup ────────────────────────────────

async function findUserByEmail(email: string): Promise<LocalUserRecord | null> {
  const n = email.toLowerCase().trim();
  const users = await usersCollection.query().fetch();
  const m = users.find((u: any) => (u.email || '').toLowerCase() === n);
  if (!m) return null;
  return {
    id: m.id,
    email: m.email,
    fullName: m.fullName ?? null,
    role: m.role ?? 'member',
    localId: m.localId ?? null,
    passwordHash: (m._raw as any)?.password_hash ?? m.passwordHash ?? '',
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
      role: (u as any).role ?? 'member',
      localId: (u as any).localId ?? null,
      passwordHash: ((u as any)._raw as any)?.password_hash ?? (u as any).passwordHash ?? '',
    };
  } catch {
    await clearSession();
    return null;
  }
}

// ─── Public Auth API ────────────────────────────

export async function createFirstAdmin(
  email: string,
  password: string,
  fullName: string,
): Promise<LocalUserRecord> {
  if ((await usersCollection.query().fetchCount()) > 0) {
    throw new Error('Admin account already exists. Please log in.');
  }
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  const bc = await getBcrypt();
  const hash = bc.hashSync(password, bc.genSaltSync(10));
  await database.write(async () => {
    await usersCollection.create((u: any) => {
      u.email = email.toLowerCase().trim();
      u.fullName = fullName;
      u.role = 'admin';
      u._raw.password_hash = hash;
      u.localId = null;
      u.createdAt = Date.now();
      u.updatedAt = Date.now();
    });
  });
  await markFirstRunDone();
  const created = await findUserByEmail(email);
  if (!created) throw new Error('Failed to create admin account.');
  await saveSession(created.id);
  return created;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LocalUserRecord> {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid email or password.');
  if (!(await getBcrypt()).compareSync(password, user.passwordHash)) {
    throw new Error('Invalid email or password.');
  }
  await saveSession(user.id);
  return user;
}

export async function logoutUser(): Promise<void> {
  await clearSession();
}

export async function getCurrentUser(): Promise<{
  id: string; email: string; role: string; fullName: string | null; localId: string | null;
} | null> {
  const u = await getSessionUser();
  return u ? { id: u.id, email: u.email, role: u.role, fullName: u.fullName, localId: u.localId } : null;
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const u = await getSessionUser();
  if (!u) throw new Error('Not authenticated.');
  if (!(await getBcrypt()).compareSync(oldPassword, u.passwordHash)) {
    throw new Error('Current password is incorrect.');
  }
  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters.');
  }
  const bc = await getBcrypt();
  const hash = bc.hashSync(newPassword, bc.genSaltSync(10));
  const rec = await usersCollection.find(u.id);
  await database.write(async () => {
    await rec.update((r: any) => {
      r._raw.password_hash = hash;
      r.updatedAt = Date.now();
    });
  });
}

// ─── DI Adapter ─────────────────────────────────

export function createAuthService(): IAuthService {
  return {
    login: async (email, password) => {
      await loginUser(email, password);
    },
    logout: async () => {
      await logoutUser();
    },
    getCurrentUser: async () => {
      const u = await getCurrentUser();
      return u ? { id: u.id, email: u.email, role: u.role } : null;
    },
    isAuthenticated: async () => (await getSavedSession()) !== null,
    createAccount: async (email, password, fullName, role) => {
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');
      const bc = await getBcrypt();
      const hash = bc.hashSync(password, bc.genSaltSync(10));
      await database.write(async () => {
        await usersCollection.create((u: any) => {
          u.email = email.toLowerCase().trim();
          u.fullName = fullName;
          u.role = role;
          u._raw.password_hash = hash;
          u.localId = null;
          u.createdAt = Date.now();
          u.updatedAt = Date.now();
        });
      });
    },
    isFirstRun: async () => isFirstRun(),
  };
}