// ============================================================
// QuickCheck — Domain Types (shared across all layers)
// ============================================================
// These types define the business domain. They are used by
// the database, services, stores, and UI components.
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

// ─── Domain Models ────────────────────────────────────────

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
  photo_url: string | null;
  password_hash: string;
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
  first_name: string;
  last_name: string;
  photo_url: string | null;
  contact_number: string | null;
  address: string | null;
  google_maps_link: string | null;
  role_in_church: string | null;
  ministry_group: string | null;
  ministry_group_id: string | null;
  member_since: string | null;
  birthday: string | null;
  emergency_contact: string | null;
  status: MemberStatus;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  // Computed / joined fields (not in DB)
  attendance_rate?: number;
  latest_status?: AttendanceStatus;
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
  // Computed / joined fields
  expected_count?: number;
  banner_url?: string | null;
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

// ─── Dashboard Aggregates ─────────────────────────────────

export interface DashboardData {
  activeMembers: number;
  membersTrend: number;
  monthlyAvg: number;
  attendanceTrend: number[];
  trendMonths: string[];
  statusDistribution: { present: number; late: number; absent: number };
  ministryGroups: { name: string; rate: number }[];
  atRiskMembers: { name: string; reason: string; rate: number }[];
  birthdaysThisWeek: string[];
  nextBirthday: { name: string; when: string };
}

// ─── Service Layer Types ──────────────────────────────────

export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string = "Network request failed") {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} with id '${id}' not found`, "NOT_FOUND", { entity, id });
    this.name = "NotFoundError";
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "BUSINESS_RULE", details);
    this.name = "BusinessRuleError";
  }
}

// ─── Repository Filters ───────────────────────────────────

export interface MemberFilters {
  status?: MemberStatus;
  ministryGroupId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface EventFilters {
  eventType?: EventType;
  ministryGroupId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AttendanceFilters {
  eventId?: string;
  memberId?: string;
  status?: AttendanceStatus;
  startDate?: string;
  endDate?: string;
}

// ─── Insert / Update Types ────────────────────────────────

export type MemberInsert = Omit<Member, "id" | "created_at" | "updated_at" | "attendance_rate" | "latest_status">;
export type MemberUpdate = Partial<Omit<Member, "id" | "created_at" | "updated_at">>;

export type EventInsert = Omit<Event, "id" | "created_at" | "updated_at" | "expected_count" | "banner_url">;
export type EventUpdate = Partial<Omit<Event, "id" | "created_at" | "updated_at">>;

export type AttendanceInsert = Omit<AttendanceRecord, "id" | "marked_at" | "updated_at">;
export type AttendanceBulkMark = {
  eventId: string;
  marks: Array<{ memberId: string; status: AttendanceStatus; minutesLate?: number }>;
};