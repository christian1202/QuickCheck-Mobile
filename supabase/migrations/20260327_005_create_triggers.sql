-- ============================================================
-- QuickCheck — Migration 005: Create Triggers
-- ============================================================
-- 1. Auto-update `updated_at` on all mutable tables
-- 2. Recompute attendance_summary on attendance_records change
-- 3. Auto-create user profile on auth.users signup
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. GENERIC: updated_at auto-updater
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ministry_groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.event_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.absence_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.attendance_summary
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- 2. ATTENDANCE SUMMARY: auto-recompute on attendance change
-- ────────────────────────────────────────────────────────────
-- This function runs SECURITY DEFINER so it can write to
-- attendance_summary even though RLS blocks direct writes.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recompute_attendance_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_member_id UUID;
  v_event_date DATE;
  v_month DATE;
  v_total INTEGER;
  v_present INTEGER;
  v_late INTEGER;
  v_absent INTEGER;
  v_excused INTEGER;
  v_rate REAL;
BEGIN
  -- Determine which member to recompute for
  IF TG_OP = 'DELETE' THEN
    v_member_id := OLD.member_id;
    -- Get event date from the event
    SELECT date INTO v_event_date FROM public.events WHERE id = OLD.event_id;
  ELSE
    v_member_id := NEW.member_id;
    SELECT date INTO v_event_date FROM public.events WHERE id = NEW.event_id;
  END IF;

  -- If event not found, exit
  IF v_event_date IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate the first day of the month
  v_month := date_trunc('month', v_event_date)::DATE;

  -- Count attendance stats for this member in this month
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE ar.status = 'present'),
    COUNT(*) FILTER (WHERE ar.status = 'late'),
    COUNT(*) FILTER (WHERE ar.status = 'absent'),
    COUNT(*) FILTER (WHERE ar.status = 'absent' AND EXISTS (
      SELECT 1 FROM public.absence_reports abr
      WHERE abr.attendance_record_id = ar.id
        AND abr.status = 'excused'
    ))
  INTO v_total, v_present, v_late, v_absent, v_excused
  FROM public.attendance_records ar
  JOIN public.events e ON e.id = ar.event_id
  WHERE ar.member_id = v_member_id
    AND date_trunc('month', e.date)::DATE = v_month;

  -- Calculate rate: (present + late) / total * 100
  IF v_total > 0 THEN
    v_rate := ((v_present + v_late)::REAL / v_total::REAL) * 100.0;
  ELSE
    v_rate := 0.0;
  END IF;

  -- Upsert the summary row
  INSERT INTO public.attendance_summary (
    member_id, month, total_events, present_count, late_count,
    absent_count, excused_count, attendance_rate
  ) VALUES (
    v_member_id, v_month, v_total, v_present, v_late,
    v_absent, v_excused, v_rate
  )
  ON CONFLICT (member_id, month) DO UPDATE SET
    total_events    = EXCLUDED.total_events,
    present_count   = EXCLUDED.present_count,
    late_count      = EXCLUDED.late_count,
    absent_count    = EXCLUDED.absent_count,
    excused_count   = EXCLUDED.excused_count,
    attendance_rate = EXCLUDED.attendance_rate,
    updated_at      = now();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on attendance_records changes
CREATE TRIGGER recompute_summary_on_attendance
  AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.recompute_attendance_summary();

-- ────────────────────────────────────────────────────────────
-- 3. Also recompute when absence_reports status changes
--    (to update excused_count)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recompute_summary_on_absence_change()
RETURNS TRIGGER AS $$
DECLARE
  v_member_id UUID;
  v_event_id UUID;
  v_event_date DATE;
  v_month DATE;
  v_attendance_record_id UUID;
  v_total INTEGER;
  v_present INTEGER;
  v_late INTEGER;
  v_absent INTEGER;
  v_excused INTEGER;
  v_rate REAL;
BEGIN
  -- Get the attendance record id
  IF TG_OP = 'DELETE' THEN
    v_attendance_record_id := OLD.attendance_record_id;
  ELSE
    v_attendance_record_id := NEW.attendance_record_id;
  END IF;

  -- Get the member and event from attendance record
  SELECT ar.member_id, ar.event_id
  INTO v_member_id, v_event_id
  FROM public.attendance_records ar
  WHERE ar.id = v_attendance_record_id;

  IF v_member_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT date INTO v_event_date FROM public.events WHERE id = v_event_id;
  IF v_event_date IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_month := date_trunc('month', v_event_date)::DATE;

  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE ar.status = 'present'),
    COUNT(*) FILTER (WHERE ar.status = 'late'),
    COUNT(*) FILTER (WHERE ar.status = 'absent'),
    COUNT(*) FILTER (WHERE ar.status = 'absent' AND EXISTS (
      SELECT 1 FROM public.absence_reports abr
      WHERE abr.attendance_record_id = ar.id
        AND abr.status = 'excused'
    ))
  INTO v_total, v_present, v_late, v_absent, v_excused
  FROM public.attendance_records ar
  JOIN public.events e ON e.id = ar.event_id
  WHERE ar.member_id = v_member_id
    AND date_trunc('month', e.date)::DATE = v_month;

  IF v_total > 0 THEN
    v_rate := ((v_present + v_late)::REAL / v_total::REAL) * 100.0;
  ELSE
    v_rate := 0.0;
  END IF;

  INSERT INTO public.attendance_summary (
    member_id, month, total_events, present_count, late_count,
    absent_count, excused_count, attendance_rate
  ) VALUES (
    v_member_id, v_month, v_total, v_present, v_late,
    v_absent, v_excused, v_rate
  )
  ON CONFLICT (member_id, month) DO UPDATE SET
    total_events    = EXCLUDED.total_events,
    present_count   = EXCLUDED.present_count,
    late_count      = EXCLUDED.late_count,
    absent_count    = EXCLUDED.absent_count,
    excused_count   = EXCLUDED.excused_count,
    attendance_rate = EXCLUDED.attendance_rate,
    updated_at      = now();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recompute_summary_on_absence
  AFTER INSERT OR UPDATE OR DELETE ON public.absence_reports
  FOR EACH ROW EXECUTE FUNCTION public.recompute_summary_on_absence_change();

-- ────────────────────────────────────────────────────────────
-- 4. AUTO-CREATE USER PROFILE on auth.users signup
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'member'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
