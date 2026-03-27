-- ============================================================
-- QuickCheck — Migration 001: Create Enum Types
-- ============================================================
-- All custom enum types used across the schema.
-- These must be created before tables reference them.
-- ============================================================

-- User roles within the system
CREATE TYPE public.user_role AS ENUM (
  'admin',      -- Manages secretaries and locals
  'secretary',  -- Full access to their local's data
  'member',     -- Views own attendance, submits absence reasons
  'viewer'      -- Read-only access to reports (church leadership)
);

-- Member lifecycle status
CREATE TYPE public.member_status AS ENUM (
  'active',       -- Currently active congregation member
  'inactive',     -- No longer actively attending
  'on_leave',     -- Temporarily away (approved)
  'transferred'   -- Moved to a different local/branch
);

-- Church event categories
CREATE TYPE public.event_type AS ENUM (
  'sunday_service',
  'prayer_meeting',
  'special_event',
  'general_assembly',
  'other'
);

-- Per-event attendance marking
CREATE TYPE public.attendance_status AS ENUM (
  'present',
  'late',
  'absent'
);

-- Absence reason categories
CREATE TYPE public.reason_category AS ENUM (
  'health',
  'work',
  'family',
  'travel',
  'no_response',
  'other'
);

-- Absence report review status
CREATE TYPE public.absence_status AS ENUM (
  'excused',
  'unexcused',
  'no_response',
  'under_review'
);
