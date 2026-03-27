-- ============================================================
-- QuickCheck — Migration 003: Create Indexes
-- ============================================================
-- Performance-critical indexes for the frontend's access patterns.
-- Designed around: paginated member lists, calendar queries,
-- Quick Mark attendance, dashboard summaries, and delta sync.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- MEMBERS: paginated list by local + status, fuzzy name search
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_members_local_id_status
  ON public.members (local_id, status);

-- Trigram index for instant local search (no network calls)
CREATE INDEX idx_members_full_name_trgm
  ON public.members USING gin (full_name gin_trgm_ops);

-- Birthday lookups (upcoming birthdays widget)
CREATE INDEX idx_members_birthday
  ON public.members (birthday);

-- Delta sync: pull all members changed since last sync
CREATE INDEX idx_members_updated_at
  ON public.members (updated_at);

-- ────────────────────────────────────────────────────────────
-- EVENTS: calendar view, dashboard, event list by local
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_events_local_id_date
  ON public.events (local_id, date);

-- Ministry group filtering
CREATE INDEX idx_events_ministry_group
  ON public.events (ministry_group_id)
  WHERE ministry_group_id IS NOT NULL;

-- Delta sync
CREATE INDEX idx_events_updated_at
  ON public.events (updated_at);

-- ────────────────────────────────────────────────────────────
-- ATTENDANCE_RECORDS: Quick Mark screen, report generation
-- ────────────────────────────────────────────────────────────
-- Get all attendance for a specific event (Quick Mark view)
CREATE INDEX idx_attendance_event_id
  ON public.attendance_records (event_id);

-- Get all attendance for a specific member (member report)
CREATE INDEX idx_attendance_member_id
  ON public.attendance_records (member_id);

-- Filter by status within an event (count present/late/absent)
CREATE INDEX idx_attendance_event_status
  ON public.attendance_records (event_id, status);

-- Delta sync
CREATE INDEX idx_attendance_updated_at
  ON public.attendance_records (updated_at);

-- ────────────────────────────────────────────────────────────
-- ATTENDANCE_SUMMARY: dashboard cards, reports
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_summary_member_month
  ON public.attendance_summary (member_id, month);

-- ────────────────────────────────────────────────────────────
-- ABSENCE_REPORTS: pending reports list, member history
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_absence_reports_status
  ON public.absence_reports (status)
  WHERE status = 'under_review';

CREATE INDEX idx_absence_reports_record
  ON public.absence_reports (attendance_record_id);

-- ────────────────────────────────────────────────────────────
-- USERS: lookup by local (secretary management)
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_users_local_id
  ON public.users (local_id);
