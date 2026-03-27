// ============================================================
// QuickCheck — Authentication Service
// ============================================================
// Wraps Supabase Auth for React Native.
// Handles sign-in, sign-out, session management, and
// biometric re-authentication.
// ============================================================

import { supabase } from "./supabase";
import type { User, UserRole } from "./types";

// ─── Auth Types ───────────────────────────────────────────

export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  localId: string | null;
  localName?: string;
}

// ─── Sign In ──────────────────────────────────────────────

/**
 * Sign in with email and password.
 * Returns the authenticated user profile.
 */
export async function signIn(
  email: string,
  password: string
): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Sign in failed: no user returned");
  }

  // Fetch the user profile with role and local info
  return await getUserProfile(data.user.id);
}

// ─── Sign Up (Admin-initiated) ────────────────────────────

/**
 * Create a new user account.
 * Typically called by an admin to onboard a new secretary or member.
 */
export async function signUp(
  email: string,
  password: string,
  metadata: {
    full_name: string;
    role: UserRole;
    local_id?: string;
  }
): Promise<{ userId: string }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Sign up failed: no user returned");
  }

  return { userId: data.user.id };
}

// ─── Sign Out ─────────────────────────────────────────────

/**
 * Sign out the current user and clear session.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

// ─── Session Management ──────────────────────────────────

/**
 * Get the current session, or null if not authenticated.
 */
export async function getSession(): Promise<AuthSession | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? "",
    },
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
}

/**
 * Get the current authenticated user's profile.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    return await getUserProfile(session.user.id);
  } catch {
    return null;
  }
}

/**
 * Listen for auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (event: string, session: AuthSession | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(
      event,
      session
        ? {
            user: {
              id: session.user.id,
              email: session.user.email ?? "",
            },
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          }
        : null
    );
  });

  return () => subscription.unsubscribe();
}

// ─── Password Management ─────────────────────────────────

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update the current user's password.
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) {
    throw new Error(error.message);
  }
}

// ─── Push Token Registration ──────────────────────────────

/**
 * Register an Expo push token for the current user.
 */
export async function registerPushToken(token: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const { error } = await (supabase as any)
    .from("users")
    .update({ push_token: token })
    .eq("id", session.user.id);

  if (error) {
    console.error("Failed to register push token:", error);
  }
}

// ─── Internal Helpers ─────────────────────────────────────

/**
 * Fetch a user profile with local name.
 */
async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await (supabase as any)
    .from("users")
    .select("id, email, full_name, role, local_id, locals(name)")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("Failed to fetch user profile");
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role as UserRole,
    localId: data.local_id,
    localName: (data as any).locals?.name,
  };
}
