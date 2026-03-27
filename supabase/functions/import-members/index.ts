// ============================================================
// QuickCheck — Import Members Edge Function
// ============================================================
// Bulk CSV import for members. Processes CSV off the main
// thread per performance requirements.
//
// POST /import-members
// Body: multipart/form-data with CSV file
// Returns: { imported: number, skipped: number, errors: string[] }
// ============================================================

import { serve } from "@std/http/server";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { requireAuth, requireRole, createUserClient } from "../_shared/auth.ts";

// Expected CSV columns (matching member table)
const REQUIRED_COLUMNS = ["full_name"];
const OPTIONAL_COLUMNS = [
  "contact_number",
  "role_in_church",
  "ministry_group",   // Matched by name → ministry_groups.id
  "member_since",
  "birthday",
  "emergency_contact",
  "status",
];

const VALID_STATUSES = ["active", "inactive", "on_leave", "transferred"];

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Require secretary role
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;

  const roleError = requireRole(user, "admin", "secretary");
  if (roleError) return roleError;

  if (!user.localId) {
    return new Response(
      JSON.stringify({ error: "User is not assigned to a local/branch" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No CSV file provided. Send as 'file' in form data." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read and parse CSV
    const csvText = await file.text();
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "CSV file is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createUserClient(req);

    // Pre-fetch ministry groups for name → id mapping
    const { data: ministryGroups } = await supabase
      .from("ministry_groups")
      .select("id, name")
      .eq("local_id", user.localId);

    const groupMap = new Map<string, string>();
    for (const g of ministryGroups || []) {
      groupMap.set(g.name.toLowerCase(), g.id);
    }

    // Process each row
    const errors: string[] = [];
    const toInsert: any[] = [];
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2; // +2 for header + 0-indexed

      // Validate required fields
      if (!row.full_name?.trim()) {
        errors.push(`Row ${lineNum}: missing required field 'full_name'`);
        skipped++;
        continue;
      }

      // Validate status if provided
      if (row.status && !VALID_STATUSES.includes(row.status.toLowerCase())) {
        errors.push(`Row ${lineNum}: invalid status '${row.status}'. Must be one of: ${VALID_STATUSES.join(", ")}`);
        skipped++;
        continue;
      }

      // Map ministry group name to ID
      let ministryGroupId: string | null = null;
      if (row.ministry_group) {
        ministryGroupId = groupMap.get(row.ministry_group.toLowerCase()) || null;
        if (!ministryGroupId) {
          errors.push(`Row ${lineNum}: unknown ministry group '${row.ministry_group}'`);
          // Don't skip — just set to null
        }
      }

      toInsert.push({
        local_id: user.localId,
        full_name: row.full_name.trim(),
        contact_number: row.contact_number?.trim() || null,
        role_in_church: row.role_in_church?.trim() || null,
        ministry_group_id: ministryGroupId,
        member_since: row.member_since || null,
        birthday: row.birthday || null,
        emergency_contact: row.emergency_contact?.trim() || null,
        status: (row.status?.toLowerCase() as any) || "active",
      });
    }

    // Batch insert (chunks of 50 for performance)
    let imported = 0;
    const CHUNK_SIZE = 50;

    for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
      const chunk = toInsert.slice(i, i + CHUNK_SIZE);
      const { error: insertError, data } = await supabase
        .from("members")
        .insert(chunk)
        .select("id");

      if (insertError) {
        errors.push(`Batch ${Math.floor(i / CHUNK_SIZE) + 1}: ${insertError.message}`);
      } else {
        imported += data?.length || chunk.length;
      }
    }

    return new Response(
      JSON.stringify({
        imported,
        skipped,
        total: rows.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Import error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to process CSV import" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── CSV Parser ───────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Parse header
  const headers = parseLine(lines[0]).map((h) =>
    h.toLowerCase().trim().replace(/\s+/g, "_")
  );

  // Parse data rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j]?.trim() || "";
    }
    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line, handling quoted fields.
 */
function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
