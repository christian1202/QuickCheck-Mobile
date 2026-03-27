// ============================================================
// QuickCheck — Export Report Edge Function
// ============================================================
// Generates CSV exports for attendance data and member reports.
// PDF generation can be added later with a library like jsPDF.
//
// POST /export-report
// Body: {
//   type: 'member_report' | 'attendance_export' | 'event_summary',
//   memberId?: string,
//   eventId?: string,
//   dateRange?: { from: string, to: string }
// }
// Returns: CSV file download
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { requireAuth, requireRole, createUserClient } from "../_shared/auth.ts";

type ExportType = "member_report" | "attendance_export" | "event_summary";

interface ExportRequest {
  type: ExportType;
  memberId?: string;
  eventId?: string;
  dateRange?: { from: string; to: string };
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Require secretary or viewer role
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;

  const roleError = requireRole(user, "admin", "secretary", "viewer");
  if (roleError) return roleError;

  try {
    const body: ExportRequest = await req.json();
    const supabase = createUserClient(req);

    let csvContent: string;
    let fileName: string;

    switch (body.type) {
      case "member_report":
        ({ csv: csvContent, fileName } = await exportMemberReport(
          supabase,
          body.memberId!
        ));
        break;

      case "attendance_export":
        ({ csv: csvContent, fileName } = await exportAttendance(
          supabase,
          body.dateRange
        ));
        break;

      case "event_summary":
        ({ csv: csvContent, fileName } = await exportEventSummary(
          supabase,
          body.eventId!
        ));
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid export type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate export" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Member Report Export ─────────────────────────────────

async function exportMemberReport(
  supabase: any,
  memberId: string
): Promise<{ csv: string; fileName: string }> {
  // Fetch member info
  const { data: member } = await supabase
    .from("members")
    .select("*, ministry_groups(name)")
    .eq("id", memberId)
    .single();

  if (!member) {
    throw new Error("Member not found");
  }

  // Fetch attendance history
  const { data: records } = await supabase
    .from("attendance_records")
    .select("*, events(name, date, time, event_type)")
    .eq("member_id", memberId)
    .order("marked_at", { ascending: false });

  // Fetch absence reports
  const recordIds = (records || []).map((r: any) => r.id);
  const { data: absences } = recordIds.length
    ? await supabase
        .from("absence_reports")
        .select("*")
        .in("attendance_record_id", recordIds)
    : { data: [] };

  const absenceMap = new Map<string, any>();
  for (const a of absences || []) {
    absenceMap.set(a.attendance_record_id, a);
  }

  // Fetch summary
  const { data: summaries } = await supabase
    .from("attendance_summary")
    .select("*")
    .eq("member_id", memberId)
    .order("month", { ascending: false });

  // Build CSV
  const lines: string[] = [];

  // Header section
  lines.push("MEMBER REPORT");
  lines.push(`Name,${escCsv(member.full_name)}`);
  lines.push(`Status,${member.status}`);
  lines.push(`Ministry Group,${member.ministry_groups?.name || "N/A"}`);
  lines.push(`Role,${member.role_in_church || "N/A"}`);
  lines.push(`Member Since,${member.member_since || "N/A"}`);
  lines.push(`Contact,${member.contact_number || "N/A"}`);
  lines.push("");

  // Monthly summary
  lines.push("MONTHLY SUMMARY");
  lines.push("Month,Total Events,Present,Late,Absent,Excused,Rate (%)");
  for (const s of summaries || []) {
    lines.push(
      `${s.month},${s.total_events},${s.present_count},${s.late_count},${s.absent_count},${s.excused_count},${s.attendance_rate.toFixed(1)}`
    );
  }
  lines.push("");

  // Attendance history
  lines.push("ATTENDANCE HISTORY");
  lines.push("Date,Event,Type,Status,Minutes Late,Absence Reason,Absence Status");
  for (const r of records || []) {
    const absence = absenceMap.get(r.id);
    lines.push(
      [
        r.events?.date || "",
        escCsv(r.events?.name || ""),
        r.events?.event_type || "",
        r.status,
        r.minutes_late || "",
        absence ? escCsv(absence.reason_text || absence.reason_category) : "",
        absence ? absence.status : "",
      ].join(",")
    );
  }

  const safeName = member.full_name.replace(/[^a-zA-Z0-9]/g, "_");
  return {
    csv: lines.join("\n"),
    fileName: `member_report_${safeName}_${new Date().toISOString().split("T")[0]}.csv`,
  };
}

// ─── Attendance Export ────────────────────────────────────

async function exportAttendance(
  supabase: any,
  dateRange?: { from: string; to: string }
): Promise<{ csv: string; fileName: string }> {
  let query = supabase
    .from("attendance_records")
    .select("*, members(full_name), events(name, date, time, event_type)")
    .order("marked_at", { ascending: false });

  if (dateRange?.from) {
    query = query.gte("events.date", dateRange.from);
  }
  if (dateRange?.to) {
    query = query.lte("events.date", dateRange.to);
  }

  const { data: records } = await query;

  const lines: string[] = [];
  lines.push("Date,Event,Event Type,Member,Status,Minutes Late,Marked At");

  for (const r of records || []) {
    lines.push(
      [
        r.events?.date || "",
        escCsv(r.events?.name || ""),
        r.events?.event_type || "",
        escCsv(r.members?.full_name || ""),
        r.status,
        r.minutes_late || "",
        r.marked_at || "",
      ].join(",")
    );
  }

  const fromStr = dateRange?.from || "all";
  const toStr = dateRange?.to || "now";
  return {
    csv: lines.join("\n"),
    fileName: `attendance_${fromStr}_to_${toStr}.csv`,
  };
}

// ─── Event Summary Export ─────────────────────────────────

async function exportEventSummary(
  supabase: any,
  eventId: string
): Promise<{ csv: string; fileName: string }> {
  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    throw new Error("Event not found");
  }

  // Fetch all attendance for this event
  const { data: records } = await supabase
    .from("attendance_records")
    .select("*, members(full_name, contact_number, ministry_groups(name))")
    .eq("event_id", eventId)
    .order("members(full_name)", { ascending: true });

  const lines: string[] = [];

  // Header
  lines.push("EVENT SUMMARY");
  lines.push(`Event,${escCsv(event.name)}`);
  lines.push(`Date,${event.date}`);
  lines.push(`Time,${event.time || "N/A"}`);
  lines.push(`Location,${escCsv(event.location || "N/A")}`);
  lines.push(`Type,${event.event_type}`);
  lines.push("");

  // Stats
  const present = (records || []).filter((r: any) => r.status === "present").length;
  const late = (records || []).filter((r: any) => r.status === "late").length;
  const absent = (records || []).filter((r: any) => r.status === "absent").length;

  lines.push("STATISTICS");
  lines.push(`Total Marked,${(records || []).length}`);
  lines.push(`Present,${present}`);
  lines.push(`Late,${late}`);
  lines.push(`Absent,${absent}`);
  lines.push(`Attendance Rate,${(records || []).length > 0 ? (((present + late) / (records || []).length) * 100).toFixed(1) : 0}%`);
  lines.push("");

  // Individual records
  lines.push("ATTENDANCE RECORDS");
  lines.push("Member,Ministry Group,Status,Minutes Late,Contact");
  for (const r of records || []) {
    lines.push(
      [
        escCsv(r.members?.full_name || ""),
        escCsv(r.members?.ministry_groups?.name || "N/A"),
        r.status,
        r.minutes_late || "",
        r.members?.contact_number || "",
      ].join(",")
    );
  }

  const safeName = event.name.replace(/[^a-zA-Z0-9]/g, "_");
  return {
    csv: lines.join("\n"),
    fileName: `event_${safeName}_${event.date}.csv`,
  };
}

// ─── CSV Helpers ──────────────────────────────────────────

function escCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
