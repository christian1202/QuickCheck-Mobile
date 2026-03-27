// ============================================================
// QuickCheck — WatermelonDB Schema
// ============================================================
// Defines the local database schema matching the Supabase
// PostgreSQL tables. This is the offline-first data layer.
//
// IMPORTANT: The column names here use snake_case to match
// Supabase exactly. The sync adapter handles the mapping.
// ============================================================

import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,
  tables: [
    // ─── Locals ─────────────────────────────────────────
    tableSchema({
      name: "locals",
      columns: [
        { name: "name", type: "string" },
        { name: "location", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
      ],
    }),

    // ─── Users ──────────────────────────────────────────
    tableSchema({
      name: "users",
      columns: [
        { name: "email", type: "string" },
        { name: "full_name", type: "string", isOptional: true },
        { name: "role", type: "string" },
        { name: "local_id", type: "string", isOptional: true, isIndexed: true },
        { name: "push_token", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // ─── Ministry Groups ────────────────────────────────
    tableSchema({
      name: "ministry_groups",
      columns: [
        { name: "local_id", type: "string", isIndexed: true },
        { name: "name", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // ─── Members ────────────────────────────────────────
    tableSchema({
      name: "members",
      columns: [
        { name: "local_id", type: "string", isIndexed: true },
        { name: "full_name", type: "string" },
        { name: "photo_url", type: "string", isOptional: true },
        { name: "contact_number", type: "string", isOptional: true },
        { name: "role_in_church", type: "string", isOptional: true },
        { name: "ministry_group_id", type: "string", isOptional: true, isIndexed: true },
        { name: "member_since", type: "string", isOptional: true },
        { name: "birthday", type: "string", isOptional: true },
        { name: "emergency_contact", type: "string", isOptional: true },
        { name: "status", type: "string" },
        { name: "user_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // ─── Event Templates ────────────────────────────────
    tableSchema({
      name: "event_templates",
      columns: [
        { name: "local_id", type: "string", isIndexed: true },
        { name: "name", type: "string" },
        { name: "event_type", type: "string" },
        { name: "default_time", type: "string", isOptional: true },
        { name: "default_location", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // ─── Events ─────────────────────────────────────────
    tableSchema({
      name: "events",
      columns: [
        { name: "local_id", type: "string", isIndexed: true },
        { name: "name", type: "string" },
        { name: "event_type", type: "string" },
        { name: "date", type: "string", isIndexed: true },
        { name: "time", type: "string", isOptional: true },
        { name: "location", type: "string", isOptional: true },
        { name: "ministry_group_id", type: "string", isOptional: true, isIndexed: true },
        { name: "is_recurring", type: "boolean" },
        { name: "recurrence_rule", type: "string", isOptional: true },
        { name: "template_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // ─── Attendance Records ─────────────────────────────
    tableSchema({
      name: "attendance_records",
      columns: [
        { name: "event_id", type: "string", isIndexed: true },
        { name: "member_id", type: "string", isIndexed: true },
        { name: "status", type: "string" },
        { name: "minutes_late", type: "number", isOptional: true },
        { name: "marked_by", type: "string", isOptional: true },
        { name: "marked_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // ─── Absence Reports ────────────────────────────────
    tableSchema({
      name: "absence_reports",
      columns: [
        { name: "attendance_record_id", type: "string", isIndexed: true },
        { name: "submitted_by", type: "string" },
        { name: "reason_category", type: "string" },
        { name: "reason_text", type: "string", isOptional: true },
        { name: "proof_url", type: "string", isOptional: true },
        { name: "status", type: "string" },
        { name: "secretary_note", type: "string", isOptional: true },
        { name: "reviewed_by", type: "string", isOptional: true },
        { name: "reviewed_at", type: "number", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // ─── Attendance Summary ─────────────────────────────
    tableSchema({
      name: "attendance_summary",
      columns: [
        { name: "member_id", type: "string", isIndexed: true },
        { name: "month", type: "string" },
        { name: "total_events", type: "number" },
        { name: "present_count", type: "number" },
        { name: "late_count", type: "number" },
        { name: "absent_count", type: "number" },
        { name: "excused_count", type: "number" },
        { name: "attendance_rate", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
});
