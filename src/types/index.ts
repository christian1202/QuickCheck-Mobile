// Data types matching the Supabase schema — ready for Phase 2 sync
// Using TypeScript interfaces that mirror the database tables exactly

export interface Local {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'secretary' | 'member' | 'viewer';
  local_id: string;
  full_name: string;
  photo_url?: string;
  created_at: string;
}

export interface Member {
  id: string;
  local_id: string;
  full_name: string;
  photo_url?: string | null;
  contact_number: string;
  role_in_church: string;
  ministry_group: string;
  member_since: string;
  birthday: string;
  emergency_contact: string;
  status: 'active' | 'inactive' | 'on_leave' | 'transferred';
  created_at: string;
  // Computed/joined
  attendance_rate?: number;
  latest_status?: 'present' | 'late' | 'absent';
}

export interface MinistryGroup {
  id: string;
  local_id: string;
  name: string;
}

export interface Event {
  id: string;
  local_id: string;
  name: string;
  event_type: 'sunday_service' | 'prayer_meeting' | 'special_event' | 'general_assembly' | 'other';
  date: string;
  time: string;
  location: string;
  ministry_group_id?: string | null;
  is_recurring: boolean;
  recurrence_rule?: string;
  template_id?: string | null;
  banner_url?: string | null;
  expected_count?: number;
  created_at: string;
}

export interface EventTemplate {
  id: string;
  local_id: string;
  name: string;
  event_type: Event['event_type'];
  default_time: string;
  default_location: string;
}

export interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: string;
  status: 'present' | 'late' | 'absent';
  minutes_late?: number | null;
  marked_by: string;
  marked_at: string;
  updated_at: string;
  // Joined
  member?: Member;
}

export interface AbsenceReport {
  id: string;
  attendance_record_id: string;
  submitted_by: string;
  reason_category: 'health' | 'work' | 'family' | 'travel' | 'no_response' | 'other';
  reason_text: string;
  proof_url?: string | null;
  status: 'excused' | 'unexcused' | 'no_response' | 'under_review';
  secretary_note?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
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

// Navigation param types
export type EventTypeLabel = {
  sunday_service: 'Sunday Service';
  prayer_meeting: 'Prayer Meeting';
  special_event: 'Special Event';
  general_assembly: 'General Assembly';
  other: 'Other';
};

export const EVENT_TYPE_LABELS: Record<Event['event_type'], string> = {
  sunday_service: 'Sunday Service',
  prayer_meeting: 'Prayer Meeting',
  special_event: 'Special Event',
  general_assembly: 'General Assembly',
  other: 'Other',
};

export const REASON_CATEGORIES: Record<AbsenceReport['reason_category'], string> = {
  health: 'Health',
  work: 'Work',
  family: 'Family',
  travel: 'Travel',
  no_response: 'No Resp.',
  other: 'Other',
};
