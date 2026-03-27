// ============================================================
// QuickCheck — Upload Proof Edge Function
// ============================================================
// Generates pre-signed upload URLs for Cloudflare R2.
// Used for absence proof photo attachments.
//
// POST /upload-proof
// Body: { fileName: string, contentType: string }
// Returns: { uploadUrl: string, publicUrl: string }
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { requireAuth, requireRole } from "../_shared/auth.ts";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.485.0";
import { getSignedUrl } from "https://esm.sh/@aws-sdk/s3-request-presigner@3.485.0";

// ─── R2 Configuration ─────────────────────────────────────

const R2_ACCOUNT_ID = "0c34f2339329210d7f357c0b698ff431";
const R2_BUCKET = "quickcheck-mobile";
const R2_PUBLIC_URL = "https://pub-dfa4fcc28ef44f88ab16402d6f97637c.r2.dev";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Require authentication
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;

  try {
    const { fileName, contentType } = await req.json();

    // ─── Validation ─────────────────────────────────────

    if (!fileName || !contentType) {
      return new Response(
        JSON.stringify({ error: "fileName and contentType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return new Response(
        JSON.stringify({
          error: `Invalid content type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Generate unique key ────────────────────────────

    const ext = fileName.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const key = `proofs/${user.localId}/${user.id}/${timestamp}.${ext}`;

    // ─── Create S3 client for R2 ────────────────────────

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID") ?? "61f0f3a6e68032344ea40d28a0091e2f",
        secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY") ?? "",
      },
    });

    // ─── Generate pre-signed upload URL ─────────────────

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return new Response(
      JSON.stringify({ uploadUrl, publicUrl, key }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Upload proof error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate upload URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
