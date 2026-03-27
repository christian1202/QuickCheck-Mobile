-- ============================================================
-- QuickCheck — Seed Data for Development
-- ============================================================
-- Creates sample data for local development and testing.
-- This matches the dashboard mockup's "Central District Branch".
-- ============================================================

-- 1. Insert a sample local
INSERT INTO public.locals (id, name, location)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Central District Branch',
  'St. Jude''s Cathedral'
);

-- 2. Insert ministry groups
INSERT INTO public.ministry_groups (id, local_id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Youth'),
  ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Choir'),
  ('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ushers'),
  ('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Elders');

-- 3. Insert event templates
INSERT INTO public.event_templates (id, local_id, name, event_type, default_time, default_location) VALUES
  ('eeeeeeee-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sunday Worship Service', 'sunday_service', '09:00:00', 'Main Hall'),
  ('eeeeeeee-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Midweek Prayer Meeting', 'prayer_meeting', '19:00:00', 'Chapel'),
  ('eeeeeeee-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Youth Fellowship', 'special_event', '18:30:00', 'Hall B');

-- 4. Insert sample events for current month (March 2026)
INSERT INTO public.events (id, local_id, name, event_type, date, time, location, ministry_group_id, is_recurring) VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Morning Prayer Service', 'prayer_meeting', CURRENT_DATE, '06:30:00', 'Hall A', NULL, false),
  ('aaaaaaaa-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sunday Worship', 'sunday_service', CURRENT_DATE + INTERVAL '3 days', '09:00:00', 'Main Hall', NULL, true),
  ('aaaaaaaa-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Weekly Youth Seminar', 'special_event', CURRENT_DATE + INTERVAL '1 day', '18:30:00', 'Hall B', '11111111-1111-1111-1111-111111111111', true),
  ('aaaaaaaa-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Leadership Retreat', 'general_assembly', CURRENT_DATE + INTERVAL '7 days', '09:00:00', 'Main Campus', NULL, false),
  ('aaaaaaaa-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Community Outreach', 'special_event', CURRENT_DATE + INTERVAL '10 days', '14:30:00', 'City Park', NULL, false),
  ('aaaaaaaa-6666-6666-6666-666666666666', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bible Study Series', 'prayer_meeting', CURRENT_DATE + INTERVAL '14 days', '19:00:00', 'Zoom', NULL, true);

-- 5. Insert sample members
INSERT INTO public.members (id, local_id, full_name, contact_number, role_in_church, ministry_group_id, member_since, birthday, status) VALUES
  ('bbbbbbbb-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Alex Murphy', '09171234567', 'Youth Leader', '11111111-1111-1111-1111-111111111111', '2022-01-15', '1998-06-20', 'active'),
  ('bbbbbbbb-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sarah Chen', '09179876543', 'Choir Director', '22222222-2222-2222-2222-222222222222', '2020-03-10', '1995-11-08', 'active'),
  ('bbbbbbbb-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jordan Williams', '09175551234', 'Member', '11111111-1111-1111-1111-111111111111', '2023-09-01', '2005-02-14', 'active'),
  ('bbbbbbbb-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Elena Hernandez', '09175559876', 'Usher', '33333333-3333-3333-3333-333333333333', '2021-07-22', '2000-12-03', 'active'),
  ('bbbbbbbb-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Julian Casablancas', '09175550001', 'Member', '11111111-1111-1111-1111-111111111111', '2024-01-10', '2001-08-23', 'active'),
  ('bbbbbbbb-6666-6666-6666-666666666666', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Marcus Aurelius', '09175550002', 'Elder', '44444444-4444-4444-4444-444444444444', '2019-05-18', '1982-03-15', 'active'),
  ('bbbbbbbb-7777-7777-7777-777777777777', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Marcus Thorne', '09175550003', 'Member', '22222222-2222-2222-2222-222222222222', '2023-04-05', '1999-03-28', 'active'),
  ('bbbbbbbb-8888-8888-8888-888888888888', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Isabella Santos', '09175550004', 'Youth Member', '11111111-1111-1111-1111-111111111111', '2024-06-15', '2004-07-12', 'active'),
  ('bbbbbbbb-9999-9999-9999-999999999999', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'David Reyes', '09175550005', 'Deacon', '44444444-4444-4444-4444-444444444444', '2018-12-01', '1975-10-30', 'active'),
  ('bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Grace Lim', '09175550006', 'Choir Member', '22222222-2222-2222-2222-222222222222', '2022-08-20', '1997-04-18', 'active');
