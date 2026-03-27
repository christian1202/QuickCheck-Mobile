// ============================================================
// QuickCheck — Sync Edge Function
// ============================================================
// WatermelonDB delta sync endpoint.
// GET  /sync?last_pulled_at=<timestamp> — pull changes
// POST /sync — push changes from client
//
// Protocol: https://watermelondb.dev/docs/Sync/Backend
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { requireAuth, createUserClient, createServiceClient } from "../_shared/auth.ts";

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Require authentication
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;

  const supabase = createUserClient(req);

  try {
    if (req.method === "GET") {
      return await handlePull(req, supabase, user);
    } else if (req.method === "POST") {
      return await handlePush(req, supabase, user);
    } else {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Sync error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── PULL: Return all changes since last_pulled_at ────────

async function handlePull(req: Request, supabase: any, user: any) {
  const url = new URL(req.url);
  const lastPulledAtParam = url.searchParams.get("last_pulled_at");

  // Convert from milliseconds timestamp or ISO string
  let lastPulledAt: string;
  if (!lastPulledAtParam || lastPulledAtParam === "null" || lastPulledAtParam === "0") {
    // First sync — pull everything
    lastPulledAt = "1970-01-01T00:00:00.000Z";
  } else {
    // WatermelonDB sends seconds since epoch
    const ms = parseInt(lastPulledAtParam) * 1000;
    lastPulledAt = new Date(ms).toISOString();
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Fetch all changed records since lastPulledAt
  // RLS automatically scopes to the user's local
  const [
    members,
    ministryGroups,
    events,
    eventTemplates,
    attendanceRecords,
    absenceReports,
    attendanceSummary,
  ] = await Promise.all([
    fetchChanges(supabase, "members", lastPulledAt),
    fetchChanges(supabase, "ministry_groups", lastPulledAt),
    fetchChanges(supabase, "events", lastPulledAt),
    fetchChanges(supabase, "event_templates", lastPulledAt),
    fetchChanges(supabase, "attendance_records", lastPulledAt),
    fetchChanges(supabase, "absence_reports", lastPulledAt),
    fetchChanges(supabase, "attendance_summary", lastPulledAt),
  ]);

  const changes = {
    members: categorizeChanges(members, lastPulledAt),
    ministry_groups: categorizeChanges(ministryGroups, lastPulledAt),
    events: categorizeChanges(events, lastPulledAt),
    event_templates: categorizeChanges(eventTemplates, lastPulledAt),
    attendance_records: categorizeChanges(attendanceRecords, lastPulledAt),
    absence_reports: categorizeChanges(absenceReports, lastPulledAt),
    attendance_summary: categorizeChanges(attendanceSummary, lastPulledAt),
  };

  return new Response(
    JSON.stringify({ changes, timestamp: currentTimestamp }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Fetch all records changed since the given timestamp.
 */
async function fetchChanges(supabase: any, table: string, since: string) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .gte("updated_at", since)
    .order("updated_at", { ascending: true });

  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }
  return data || [];
}

/**
 * Categorize changes into created/updated/deleted format
 * expected by WatermelonDB's synchronize().
 */
function categorizeChanges(records: any[], lastPulledAt: string) {
  // For simplicity, treat all records as either created or updated
  // (soft deletes would need a `deleted_at` column to detect deletions)
  const isFirstSync = lastPulledAt === "1970-01-01T00:00:00.000Z";

  if (isFirstSync) {
    return {
      created: records,
      updated: [],
      deleted: [],
    };
  }

  const created: any[] = [];
  const updated: any[] = [];

  for (const record of records) {
    // If created_at is after lastPulledAt, it's a new record
    if (record.created_at && new Date(record.created_at) >= new Date(lastPulledAt)) {
      created.push(record);
    } else {
      updated.push(record);
    }
  }

  return { created, updated, deleted: [] };
}

// ─── PUSH: Accept changes from the client ─────────────────

async function handlePush(req: Request, supabase: any, user: any) {
  const body = await req.json();
  const { changes, lastPulledAt } = body;

  if (!changes) {
    return new Response(
      JSON.stringify({ error: "Missing 'changes' in request body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const results: Record<string, { created: number; updated: number; deleted: number }> = {};

  // Process each table's changes
  const tables = [
    "members",
    "ministry_groups",
    "events",
    "event_templates",
    "attendance_records",
    "absence_reports",
  ];

  for (const table of tables) {
    if (changes[table]) {
      results[table] = await applyChanges(supabase, table, changes[table], user);
    }
  }

  return new Response(
    JSON.stringify({ ok: true, results }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Apply created/updated/deleted changes to a table.
 */
async function applyChanges(
  supabase: any,
  table: string,
  changes: { created?: any[]; updated?: any[]; deleted?: string[] },
  user: any
) {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  // Handle created records
  if (changes.created?.length) {
    const records = changes.created.map((r: any) => ({
      ...sanitizeRecord(r, table),
      // Ensure local scoping for new records
      ...(table !== "attendance_records" && table !== "absence_reports"
        ? { local_id: user.localId }
        : {}),
    }));

    const { error } = await supabase.from(table).upsert(records, {
      onConflict: getConflictKey(table),
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(`Error creating ${table}:`, error);
    } else {
      created = records.length;
    }
  }

  // Handle updated records
  if (changes.updated?.length) {
    for (const record of changes.updated) {
      const sanitized = sanitizeRecord(record, table);
      const { error } = await supabase
        .from(table)
        .update(sanitized)
        .eq("id", record.id);

      if (error) {
        console.error(`Error updating ${table} ${record.id}:`, error);
      } else {
        updated++;
      }
    }
  }

  // Handle deleted records (soft or hard delete)
  if (changes.deleted?.length) {
    for (const id of changes.deleted) {
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) {
        console.error(`Error deleting ${table} ${id}:`, error);
      } else {
        deleted++;
      }
    }
  }

  return { created, updated, deleted };
}

/**
 * Remove WatermelonDB-specific fields that shouldn't be sent to Supabase.
 */
function sanitizeRecord(record: any, _table: string) {
  const { _status, _changed, ...rest } = record;
  return rest;
}

/**
 * Get the conflict key for upsert operations.
 */
function getConflictKey(table: string): string {
  switch (table) {
    case "attendance_records":
      return "event_id,member_id";
    case "attendance_summary":
      return "member_id,month";
    default:
      return "id";
  }
}
