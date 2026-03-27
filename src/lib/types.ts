// ============================================================
// QuickCheck — Shared TypeScript Types (Frontend)
// ============================================================
// Mirrors the database types for use in React Native code.
// Import from here instead of the Edge Functions shared types.
// ============================================================

// ─── Enum Types ───────────────────────────────────────────

export type UserRole = "admin" | "secretary" | "member" | "viewer";
export type MemberStatus = "active" | "inactive" | "on_leave" | "transferred";
export type EventType =
  | "sunday_service"
  | "prayer_meeting"
  | "special_event"
  | "general_assembly"
  | "other";
export type AttendanceStatus = "present" | "late" | "absent";
export type ReasonCategory =
  | "health"
  | "work"
  | "family"
  | "travel"
  | "no_response"
  | "other";
export type AbsenceStatus =
  | "excused"
  | "unexcused"
  | "no_response"
  | "under_review";

// ─── Database Row Types ───────────────────────────────────

export interface Local {
  id: string;
  name: string;
  location: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  local_id: string | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface MinistryGroup {
  id: string;
  local_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  local_id: string;
  full_name: string;
  photo_url: string | null;
  contact_number: string | null;
  role_in_church: string | null;
  ministry_group_id: string | null;
  member_since: string | null;
  birthday: string | null;
  emergency_contact: string | null;
  status: MemberStatus;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  local_id: string;
  name: string;
  event_type: EventType;
  date: string;
  time: string | null;
  location: string | null;
  ministry_group_id: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  template_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventTemplate {
  id: string;
  local_id: string;
  name: string;
  event_type: EventType;
  default_time: string | null;
  default_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: string;
  status: AttendanceStatus;
  minutes_late: number | null;
  marked_by: string | null;
  marked_at: string;
  updated_at: string;
}

export interface AbsenceReport {
  id: string;
  attendance_record_id: string;
  submitted_by: string;
  reason_category: ReasonCategory;
  reason_text: string | null;
  proof_url: string | null;
  status: AbsenceStatus;
  secretary_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSummary {
  id: string;
  member_id: string;
  month: string;
  total_events: number;
  present_count: number;
  late_count: number;
  absent_count: number;
  excused_count: number;
  attendance_rate: number;
  updated_at: string;
}

// ─── Supabase Database Type Map ───────────────────────────

export interface Database {
  public: {
    Tables: {
      locals: {
        Row: Local;
        Insert: Omit<Local, "id" | "created_at">;
        Update: Partial<Omit<Local, "id">>;
      };
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "updated_at">;
        Update: Partial<Omit<User, "id">>;
      };
      ministry_groups: {
        Row: MinistryGroup;
        Insert: Omit<MinistryGroup, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<MinistryGroup, "id">>;
      };
      members: {
        Row: Member;
        Insert: Omit<Member, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Member, "id">>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Event, "id">>;
      };
      event_templates: {
        Row: EventTemplate;
        Insert: Omit<EventTemplate, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<EventTemplate, "id">>;
      };
      attendance_records: {
        Row: AttendanceRecord;
        Insert: Omit<AttendanceRecord, "id" | "marked_at" | "updated_at">;
        Update: Partial<Omit<AttendanceRecord, "id">>;
      };
      absence_reports: {
        Row: AbsenceReport;
        Insert: Omit<AbsenceReport, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<AbsenceReport, "id">>;
      };
      attendance_summary: {
        Row: AttendanceSummary;
        Insert: Omit<AttendanceSummary, "id" | "updated_at">;
        Update: Partial<Omit<AttendanceSummary, "id">>;
      };
    };
    Enums: {
      user_role: UserRole;
      member_status: MemberStatus;
      event_type: EventType;
      attendance_status: AttendanceStatus;
      reason_category: ReasonCategory;
      absence_status: AbsenceStatus;
    };
  };
}
