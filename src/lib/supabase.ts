// ============================================================
// QuickCheck — Supabase Client Initialization
// ============================================================
// React Native + Expo Supabase client with AsyncStorage for
// session persistence and auto token refresh.
// ============================================================

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";

// ─── Supabase Configuration ──────────────────────────────

const SUPABASE_URL = "https://rjfqjfkinuoqxagkbzlo.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// ─── Client Instance ─────────────────────────────────────

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Not needed for React Native
    },
  }
);

// ─── Edge Function Helper ────────────────────────────────

/**
 * Invoke a Supabase Edge Function with automatic auth headers.
 */
export async function invokeFunction<T = any>(
  name: string,
  body?: Record<string, any>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, {
    body: body ? JSON.stringify(body) : undefined,
  });

  if (error) {
    throw new Error(`Edge Function '${name}' failed: ${error.message}`);
  }

  return data as T;
}

// ─── File Upload Helper ──────────────────────────────────

/**
 * Upload a file to Cloudflare R2 via the upload-proof Edge Function.
 * Returns the public URL of the uploaded file.
 */
export async function uploadProofPhoto(
  fileUri: string,
  fileName: string,
  contentType: string
): Promise<string> {
  // 1. Get pre-signed upload URL
  const { uploadUrl, publicUrl } = await invokeFunction<{
    uploadUrl: string;
    publicUrl: string;
  }>("upload-proof", { fileName, contentType });

  // 2. Read file and upload to R2
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to R2");
  }

  return publicUrl;
}

export default supabase;
