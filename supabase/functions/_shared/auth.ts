// ============================================================
// QuickCheck — Shared Auth Helpers for Edge Functions
// ============================================================

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * User context extracted from the JWT.
 */
export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "secretary" | "member" | "viewer";
  localId: string | null;
}

/**
 * Create a Supabase client with the user's JWT for RLS.
 */
export function createUserClient(req: Request): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );
}

/**
 * Create a Supabase client with the service role key.
 * Bypasses RLS — use only for system operations.
 */
export function createServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

/**
 * Extract and validate the authenticated user from the request.
 * Returns null if not authenticated.
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const client = createUserClient(req);

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Fetch user profile with role and local_id
  const { data: profile } = await client
    .from("users")
    .select("role, local_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
    role: profile.role,
    localId: profile.local_id,
  };
}

/**
 * Require authentication. Returns 401 response if not authenticated.
 */
export async function requireAuth(
  req: Request
): Promise<{ user: AuthUser; error?: never } | { user?: never; error: Response }> {
  const user = await getAuthUser(req);

  if (!user) {
    return {
      error: new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }

  return { user };
}

/**
 * Require a specific role. Returns 403 response if role doesn't match.
 */
export function requireRole(
  user: AuthUser,
  ...allowedRoles: AuthUser["role"][]
): Response | null {
  if (!allowedRoles.includes(user.role)) {
    return new Response(
      JSON.stringify({ error: "Forbidden: insufficient permissions" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  return null;
}
