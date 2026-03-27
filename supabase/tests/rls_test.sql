-- ============================================================
-- QuickCheck — RLS Policy Test Script
-- ============================================================
-- Run this against your Supabase database to verify RLS
-- policies are working correctly.
--
-- Usage: Run in Supabase SQL Editor or via psql
-- ============================================================

-- Helper: Show current test
CREATE OR REPLACE FUNCTION test_header(test_name TEXT)
RETURNS VOID AS $$
BEGIN
  RAISE NOTICE '─── TEST: % ───', test_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TEST 1: Verify RLS is enabled on all tables
-- ============================================================
SELECT test_header('RLS Enabled on All Tables');

SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'locals', 'users', 'members', 'ministry_groups',
    'events', 'event_templates', 'attendance_records',
    'absence_reports', 'attendance_summary'
  )
ORDER BY tablename;

-- Expected: All rows should show rowsecurity = true

-- ============================================================
-- TEST 2: Verify helper functions exist
-- ============================================================
SELECT test_header('Helper Functions Exist');

SELECT
  routine_name,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_user_local_id', 'get_user_role');

-- Expected: Both functions should appear

-- ============================================================
-- TEST 3: Verify triggers exist
-- ============================================================
SELECT test_header('Triggers Exist');

SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Expected: updated_at triggers on all tables,
-- recompute triggers on attendance_records and absence_reports

-- ============================================================
-- TEST 4: Verify indexes exist
-- ============================================================
SELECT test_header('Indexes Exist');

SELECT
  indexname,
  tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Expected: All custom indexes from migration 003

-- ============================================================
-- TEST 5: Verify enum types exist
-- ============================================================
SELECT test_header('Enum Types Exist');

SELECT
  t.typname AS enum_name,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN (
  'user_role', 'member_status', 'event_type',
  'attendance_status', 'reason_category', 'absence_status'
)
GROUP BY t.typname
ORDER BY t.typname;

-- Expected: All 6 enum types with their correct values

-- ============================================================
-- TEST 6: Verify table structure
-- ============================================================
SELECT test_header('Table Columns');

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'locals', 'users', 'members', 'ministry_groups',
    'events', 'event_templates', 'attendance_records',
    'absence_reports', 'attendance_summary'
  )
ORDER BY table_name, ordinal_position;

-- ============================================================
-- TEST 7: Verify unique constraints
-- ============================================================
SELECT test_header('Unique Constraints');

SELECT
  tc.table_name,
  tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- Expected:
-- attendance_records: (event_id, member_id)
-- attendance_summary: (member_id, month)
-- ministry_groups: (local_id, name)

-- ============================================================
-- CLEANUP
-- ============================================================
DROP FUNCTION IF EXISTS test_header(TEXT);

-- Done! Check the output above for any unexpected results.
