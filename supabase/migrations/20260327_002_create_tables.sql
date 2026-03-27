-- ============================================================
-- QuickCheck — Migration 002: Create Tables
-- ============================================================
-- All 9 tables matching the context document schema.
-- Order: dependencies first (locals → users → members → etc.)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- For fuzzy member name search

-- ============================================================
-- TABLE: locals
-- Church branches/locals — the top-level tenant boundary.
-- Every piece of data in the system is scoped to a local.
-- ============================================================
CREATE TABLE public.locals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  location    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.locals IS 'Church branches/locals — tenant boundary for RLS';

-- ============================================================
-- TABLE: users
-- Auth-linked user profiles with role and local assignment.
-- id references auth.users(id) for Supabase Auth integration.
-- ============================================================
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        public.user_role NOT NULL DEFAULT 'member',
  local_id    UUID REFERENCES public.locals(id) ON DELETE SET NULL,
  push_token  TEXT,                -- Expo push notification token
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'User profiles linked to Supabase Auth with role-based access';

-- ============================================================
-- TABLE: ministry_groups
-- Named ministry groups per local (Youth, Choir, Ushers, etc.)
-- ============================================================
CREATE TABLE public.ministry_groups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  local_id    UUID NOT NULL REFERENCES public.locals(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (local_id, name)
);

COMMENT ON TABLE public.ministry_groups IS 'Ministry groups scoped to each local/branch';

-- ============================================================
-- TABLE: members
-- Congregation members scoped to a local.
-- This is the core entity — attendance, reports, everything
-- hangs off of members.
-- ============================================================
CREATE TABLE public.members (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  local_id          UUID NOT NULL REFERENCES public.locals(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  photo_url         TEXT,                          -- Cloudflare R2 URL
  contact_number    TEXT,
  role_in_church    TEXT,
  ministry_group_id UUID REFERENCES public.ministry_groups(id) ON DELETE SET NULL,
  member_since      DATE,
  birthday          DATE,
  emergency_contact TEXT,
  status            public.member_status NOT NULL DEFAULT 'active',
  user_id           UUID REFERENCES public.users(id) ON DELETE SET NULL,  -- Link to app user (if member has an account)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.members IS 'Congregation members — core entity scoped to a local';

-- ============================================================
-- TABLE: event_templates
-- Reusable templates for frequently created event types.
-- ============================================================
CREATE TABLE public.event_templates (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  local_id         UUID NOT NULL REFERENCES public.locals(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  event_type       public.event_type NOT NULL DEFAULT 'other',
  default_time     TIME,
  default_location TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.event_templates IS 'Reusable event templates per local';

-- ============================================================
-- TABLE: events
-- Church events with type, date, optional recurrence, and
-- optional ministry group targeting.
-- ============================================================
CREATE TABLE public.events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  local_id          UUID NOT NULL REFERENCES public.locals(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  event_type        public.event_type NOT NULL DEFAULT 'other',
  date              DATE NOT NULL,
  time              TIME,
  location          TEXT,
  ministry_group_id UUID REFERENCES public.ministry_groups(id) ON DELETE SET NULL,
  is_recurring      BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule   TEXT,                          -- RRULE format string
  template_id       UUID REFERENCES public.event_templates(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.events IS 'Church events with optional recurrence and ministry targeting';

-- ============================================================
-- TABLE: attendance_records
-- Individual attendance marks — one per member per event.
-- This is the most write-heavy table (Quick Mark mode).
-- ============================================================
CREATE TABLE public.attendance_records (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id    UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  status       public.attendance_status NOT NULL DEFAULT 'absent',
  minutes_late INTEGER,                            -- Only populated when status = 'late'
  marked_by    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  marked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (event_id, member_id)                     -- One mark per member per event
);

COMMENT ON TABLE public.attendance_records IS 'Attendance marks — one per (event, member) pair';

-- ============================================================
-- TABLE: absence_reports
-- Linked absence reasons with proof attachments and review.
-- ============================================================
CREATE TABLE public.absence_reports (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_record_id  UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  submitted_by          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason_category       public.reason_category NOT NULL DEFAULT 'no_response',
  reason_text           TEXT,
  proof_url             TEXT,                      -- Cloudflare R2 URL
  status                public.absence_status NOT NULL DEFAULT 'under_review',
  secretary_note        TEXT,                      -- Internal note, not visible to member
  reviewed_by           UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.absence_reports IS 'Absence reasons with proof and secretary review workflow';

-- ============================================================
-- TABLE: attendance_summary
-- Pre-computed monthly attendance aggregates per member.
-- Updated automatically by trigger on attendance_records.
-- Dashboard and reports read from this table for instant loads.
-- ============================================================
CREATE TABLE public.attendance_summary (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  month           DATE NOT NULL,                   -- First day of month (e.g. 2026-03-01)
  total_events    INTEGER NOT NULL DEFAULT 0,
  present_count   INTEGER NOT NULL DEFAULT 0,
  late_count      INTEGER NOT NULL DEFAULT 0,
  absent_count    INTEGER NOT NULL DEFAULT 0,
  excused_count   INTEGER NOT NULL DEFAULT 0,
  attendance_rate REAL NOT NULL DEFAULT 0.0,       -- Percentage (0.0 to 100.0)
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (member_id, month)                        -- One summary row per member per month
);

COMMENT ON TABLE public.attendance_summary IS 'Pre-computed monthly attendance aggregates for instant dashboard/report loads';
