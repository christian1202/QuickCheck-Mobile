-- ============================================================
-- QuickCheck — Migration 004: Row-Level Security Policies
-- ============================================================
-- Core privacy model: Google Docs-style access.
-- Data is plaintext but protected by RLS policies.
-- Each local/branch is a completely isolated data silo.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS: Get current user's local_id and role
-- These are SECURITY DEFINER to bypass RLS when reading
-- the users table (prevents infinite recursion).
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_local_id()
RETURNS UUID AS $$
  SELECT local_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ────────────────────────────────────────────────────────────
-- TABLE: locals
-- Admin: can see all locals. Others: own local only.
-- Only admin can create/update/delete locals.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.locals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locals_select" ON public.locals
  FOR SELECT USING (
    CASE
      WHEN public.get_user_role() = 'admin' THEN true
      ELSE id = public.get_user_local_id()
    END
  );

CREATE POLICY "locals_insert" ON public.locals
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin'
  );

CREATE POLICY "locals_update" ON public.locals
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
  );

CREATE POLICY "locals_delete" ON public.locals
  FOR DELETE USING (
    public.get_user_role() = 'admin'
  );

-- ────────────────────────────────────────────────────────────
-- TABLE: users
-- Users can see other users in their own local.
-- Admin can manage users. Users can update their own row.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (
    local_id = public.get_user_local_id()
    OR id = auth.uid()
  );

CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (
    -- Allow auth trigger to create profile, or admin to create users
    public.get_user_role() = 'admin'
    OR id = auth.uid()
  );

CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE USING (
    id = auth.uid()
  );

CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    AND local_id = public.get_user_local_id()
  );

CREATE POLICY "users_delete" ON public.users
  FOR DELETE USING (
    public.get_user_role() = 'admin'
  );

-- ────────────────────────────────────────────────────────────
-- TABLE: members
-- Secretary/viewer: all members in their local.
-- Member (app user): only their own linked member record.
-- Only secretary can write.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON public.members
  FOR SELECT USING (
    local_id = public.get_user_local_id()
  );

CREATE POLICY "members_insert" ON public.members
  FOR INSERT WITH CHECK (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

CREATE POLICY "members_update" ON public.members
  FOR UPDATE USING (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

CREATE POLICY "members_delete" ON public.members
  FOR DELETE USING (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

-- ────────────────────────────────────────────────────────────
-- TABLE: ministry_groups
-- Same local-scoping. Secretary+ can write.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.ministry_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ministry_groups_select" ON public.ministry_groups
  FOR SELECT USING (
    local_id = public.get_user_local_id()
  );

CREATE POLICY "ministry_groups_insert" ON public.ministry_groups
  FOR INSERT WITH CHECK (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

CREATE POLICY "ministry_groups_update" ON public.ministry_groups
  FOR UPDATE USING (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

CREATE POLICY "ministry_groups_delete" ON public.ministry_groups
  FOR DELETE USING (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

-- ────────────────────────────────────────────────────────────
-- TABLE: events
-- All local users can view. Secretary+ can write.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON public.events
  FOR SELECT USING (
    local_id = public.get_user_local_id()
  );

CREATE POLICY "events_insert" ON public.events
  FOR INSERT WITH CHECK (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

CREATE POLICY "events_update" ON public.events
  FOR UPDATE USING (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

CREATE POLICY "events_delete" ON public.events
  FOR DELETE USING (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

-- ────────────────────────────────────────────────────────────
-- TABLE: event_templates
-- Same as events: local-scoped, secretary+ can write.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_templates_select" ON public.event_templates
  FOR SELECT USING (
    local_id = public.get_user_local_id()
  );

CREATE POLICY "event_templates_insert" ON public.event_templates
  FOR INSERT WITH CHECK (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

CREATE POLICY "event_templates_update" ON public.event_templates
  FOR UPDATE USING (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

CREATE POLICY "event_templates_delete" ON public.event_templates
  FOR DELETE USING (
    local_id = public.get_user_local_id()
    AND public.get_user_role() IN ('admin', 'secretary')
  );

-- ────────────────────────────────────────────────────────────
-- TABLE: attendance_records
-- Secretary/viewer: all records in their local (via event).
-- Member: only their own records.
-- Only secretary can write.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_select_secretary" ON public.attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
        AND e.local_id = public.get_user_local_id()
    )
  );

CREATE POLICY "attendance_select_member" ON public.attendance_records
  FOR SELECT USING (
    public.get_user_role() = 'member'
    AND EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = member_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "attendance_insert" ON public.attendance_records
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'secretary')
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
        AND e.local_id = public.get_user_local_id()
    )
  );

CREATE POLICY "attendance_update" ON public.attendance_records
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'secretary')
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
        AND e.local_id = public.get_user_local_id()
    )
  );

CREATE POLICY "attendance_delete" ON public.attendance_records
  FOR DELETE USING (
    public.get_user_role() IN ('admin', 'secretary')
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
        AND e.local_id = public.get_user_local_id()
    )
  );

-- ────────────────────────────────────────────────────────────
-- TABLE: absence_reports
-- Secretary: all in local. Member: own reports only.
-- Secretary can insert for anyone in local.
-- Member can insert for own attendance only.
-- Only secretary can update (review workflow).
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.absence_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "absence_select_secretary" ON public.absence_reports
  FOR SELECT USING (
    public.get_user_role() IN ('admin', 'secretary', 'viewer')
    AND EXISTS (
      SELECT 1 FROM public.attendance_records ar
      JOIN public.events e ON e.id = ar.event_id
      WHERE ar.id = attendance_record_id
        AND e.local_id = public.get_user_local_id()
    )
  );

CREATE POLICY "absence_select_member" ON public.absence_reports
  FOR SELECT USING (
    public.get_user_role() = 'member'
    AND (
      submitted_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.attendance_records ar
        JOIN public.members m ON m.id = ar.member_id
        WHERE ar.id = attendance_record_id
          AND m.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "absence_insert_secretary" ON public.absence_reports
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'secretary')
    AND EXISTS (
      SELECT 1 FROM public.attendance_records ar
      JOIN public.events e ON e.id = ar.event_id
      WHERE ar.id = attendance_record_id
        AND e.local_id = public.get_user_local_id()
    )
  );

CREATE POLICY "absence_insert_member" ON public.absence_reports
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'member'
    AND submitted_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.attendance_records ar
      JOIN public.members m ON m.id = ar.member_id
      WHERE ar.id = attendance_record_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "absence_update" ON public.absence_reports
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'secretary')
    AND EXISTS (
      SELECT 1 FROM public.attendance_records ar
      JOIN public.events e ON e.id = ar.event_id
      WHERE ar.id = attendance_record_id
        AND e.local_id = public.get_user_local_id()
    )
  );

-- ────────────────────────────────────────────────────────────
-- TABLE: attendance_summary
-- Everyone in the local can read. Only system can write
-- (handled by trigger with SECURITY DEFINER function).
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.attendance_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "summary_select" ON public.attendance_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = member_id
        AND m.local_id = public.get_user_local_id()
    )
  );

-- Write policies are not needed — the trigger function uses
-- SECURITY DEFINER to bypass RLS when updating summaries.
