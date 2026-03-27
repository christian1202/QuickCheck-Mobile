// Mock/seed data for Phase 1 demo
import { Member, Event, AttendanceRecord, MinistryGroup, User, Local } from '../types';

export const MOCK_LOCAL: Local = {
  id: 'local-001',
  name: "St. Jude's Cathedral",
  location: 'Central District',
  created_at: '2024-01-01T00:00:00Z',
};

export const MOCK_USER: User = {
  id: 'user-001',
  email: 'sarah@quickcheck.org',
  role: 'secretary',
  local_id: 'local-001',
  full_name: 'Sarah Martinez',
  photo_url: undefined,
  created_at: '2024-01-01T00:00:00Z',
};

export const MOCK_MINISTRY_GROUPS: MinistryGroup[] = [
  { id: 'mg-01', local_id: 'local-001', name: 'Youth Ministry' },
  { id: 'mg-02', local_id: 'local-001', name: 'Worship Team' },
  { id: 'mg-03', local_id: 'local-001', name: 'Media & Tech' },
  { id: 'mg-04', local_id: 'local-001', name: 'Community Outreach' },
  { id: 'mg-05', local_id: 'local-001', name: 'Ushers' },
  { id: 'mg-06', local_id: 'local-001', name: 'Choir' },
  { id: 'mg-07', local_id: 'local-001', name: 'Elders' },
];

export const MOCK_MEMBERS: Member[] = [
  {
    id: 'm-001', local_id: 'local-001', full_name: 'Felix Jamieson',
    photo_url: undefined, contact_number: '+1 (555) 100-1001',
    role_in_church: 'Youth Leader', ministry_group: 'Youth Ministry',
    member_since: '2020-03-15', birthday: '1998-06-22',
    emergency_contact: 'Maria Jamieson - +1 (555) 100-2001',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 94, latest_status: 'present',
  },
  {
    id: 'm-002', local_id: 'local-001', full_name: 'Sarah Jenkins',
    photo_url: undefined, contact_number: '+1 (555) 100-1002',
    role_in_church: 'Vocalist', ministry_group: 'Worship Team',
    member_since: '2019-08-10', birthday: '1995-11-14',
    emergency_contact: 'Tom Jenkins - +1 (555) 100-2002',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 72, latest_status: 'absent',
  },
  {
    id: 'm-003', local_id: 'local-001', full_name: 'Marcus Thorne',
    photo_url: undefined, contact_number: '+1 (555) 100-1003',
    role_in_church: 'Tech Lead', ministry_group: 'Media & Tech',
    member_since: '2021-01-20', birthday: '2026-03-28',
    emergency_contact: 'Lisa Thorne - +1 (555) 100-2003',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 88, latest_status: 'late',
  },
  {
    id: 'm-004', local_id: 'local-001', full_name: 'Elena Rodriguez',
    photo_url: undefined, contact_number: '+1 (555) 100-1004',
    role_in_church: 'Outreach Coordinator', ministry_group: 'Community Outreach',
    member_since: '2018-05-01', birthday: '1990-09-30',
    emergency_contact: 'Carlos Rodriguez - +1 (555) 100-2004',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 100, latest_status: 'present',
  },
  {
    id: 'm-005', local_id: 'local-001', full_name: 'David Chen',
    photo_url: undefined, contact_number: '+1 (555) 100-1005',
    role_in_church: 'Worship Lead', ministry_group: 'Worship Team',
    member_since: '2017-11-15', birthday: '1988-02-14',
    emergency_contact: 'Amy Chen - +1 (555) 100-2005',
    status: 'inactive', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 65, latest_status: 'absent',
  },
  {
    id: 'm-006', local_id: 'local-001', full_name: 'Amara Okafor',
    photo_url: undefined, contact_number: '+1 (555) 100-1006',
    role_in_church: 'Youth Mentor', ministry_group: 'Youth Ministry',
    member_since: '2022-02-28', birthday: '2001-07-19',
    emergency_contact: 'James Okafor - +1 (555) 100-2006',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 92, latest_status: 'present',
  },
  {
    id: 'm-007', local_id: 'local-001', full_name: 'Julian Casablancas',
    photo_url: undefined, contact_number: '+1 (555) 100-1007',
    role_in_church: 'Member', ministry_group: 'Ushers',
    member_since: '2023-01-10', birthday: '1985-08-23',
    emergency_contact: 'Sofia Casablancas - +1 (555) 100-2007',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 42, latest_status: 'absent',
  },
  {
    id: 'm-008', local_id: 'local-001', full_name: 'Marcus Aurelius',
    photo_url: undefined, contact_number: '+1 (555) 100-1008',
    role_in_church: 'Senior Member', ministry_group: 'Elders',
    member_since: '2015-04-20', birthday: '1970-12-05',
    emergency_contact: 'Claudia Aurelius - +1 (555) 100-2008',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 68, latest_status: 'absent',
  },
  {
    id: 'm-009', local_id: 'local-001', full_name: 'Jordan Williams',
    photo_url: undefined, contact_number: '+1 (555) 100-1009',
    role_in_church: 'Choir Member', ministry_group: 'Choir',
    member_since: '2023-06-15', birthday: '2000-04-11',
    emergency_contact: 'Karen Williams - +1 (555) 100-2009',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 45, latest_status: 'absent',
  },
  {
    id: 'm-010', local_id: 'local-001', full_name: 'Alex Murphy',
    photo_url: undefined, contact_number: '+1 (555) 100-1010',
    role_in_church: 'Usher', ministry_group: 'Ushers',
    member_since: '2021-09-01', birthday: '1993-01-30',
    emergency_contact: 'Pat Murphy - +1 (555) 100-2010',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 85, latest_status: 'present',
  },
  {
    id: 'm-011', local_id: 'local-001', full_name: 'Benjamin Harrison',
    photo_url: undefined, contact_number: '+1 (555) 100-1011',
    role_in_church: 'Senior Architect', ministry_group: 'Community Outreach',
    member_since: '2016-02-14', birthday: '1982-10-17',
    emergency_contact: 'Helen Harrison - +1 (555) 100-2011',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 94, latest_status: 'present',
  },
  {
    id: 'm-012', local_id: 'local-001', full_name: 'Marcus Henderson',
    photo_url: undefined, contact_number: '+1 (555) 100-1012',
    role_in_church: 'Youth Leader', ministry_group: 'Youth Ministry',
    member_since: '2019-07-22', birthday: '1997-03-08',
    emergency_contact: 'Diana Henderson - +1 (555) 100-2012',
    status: 'active', created_at: '2024-01-01T00:00:00Z',
    attendance_rate: 91, latest_status: 'present',
  },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e-001', local_id: 'local-001', name: 'Morning Prayer Service',
    event_type: 'prayer_meeting', date: new Date().toISOString().split('T')[0],
    time: '07:00', location: 'Hall A', is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=SU',
    expected_count: 150, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e-002', local_id: 'local-001', name: 'Weekly Youth Seminar',
    event_type: 'special_event', date: '2024-10-24',
    time: '18:30', location: 'Community Hall', is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=TH',
    ministry_group_id: 'mg-01',
    expected_count: 80, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e-003', local_id: 'local-001',
    name: 'Annual Community Leadership Forum 2024',
    event_type: 'general_assembly', date: '2024-10-24',
    time: '09:00', location: 'Grand Hall, Civic Center', is_recurring: false,
    expected_count: 1240, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e-004', local_id: 'local-001', name: 'Digital Literacy Training for Seniors',
    event_type: 'special_event', date: '2024-10-12',
    time: '14:00', location: 'Conference Room B', is_recurring: false,
    expected_count: 45, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e-005', local_id: 'local-001', name: 'Weekly Morning Prayer & Coffee',
    event_type: 'prayer_meeting', date: '2024-10-28',
    time: '06:30', location: 'West Wing Lounge', is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    expected_count: 120, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e-006', local_id: 'local-001', name: 'Leadership Retreat',
    event_type: 'special_event', date: '2024-06-18',
    time: '09:00', location: 'Main Campus', is_recurring: false,
    expected_count: 30, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e-007', local_id: 'local-001', name: 'Community Outreach',
    event_type: 'special_event', date: '2024-06-21',
    time: '14:30', location: 'City Park', is_recurring: false,
    expected_count: 200, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e-008', local_id: 'local-001', name: 'Bible Study Series',
    event_type: 'prayer_meeting', date: '2024-06-24',
    time: '19:00', location: 'Zoom', is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=WE',
    expected_count: 50, created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock attendance data for Quick Mark
export const MOCK_ATTENDANCE: AttendanceRecord[] = MOCK_MEMBERS.slice(0, 4).map((m, i) => ({
  id: `att-${i + 1}`,
  event_id: 'e-002',
  member_id: m.id,
  status: (['present', 'present', 'absent', 'present'] as const)[i],
  minutes_late: i === 0 ? null : null,
  marked_by: 'user-001',
  marked_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  member: m,
}));

// Dashboard stats
export const MOCK_DASHBOARD = {
  activeMembers: 1284,
  membersTrend: +12,
  monthlyAvg: 94,
  attendanceTrend: [60, 75, 45, 90, 82, 95], // last 6 months percentages
  trendMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  statusDistribution: { present: 72, late: 15, absent: 13 },
  ministryGroups: [
    { name: 'Youth', rate: 98 },
    { name: 'Choir', rate: 84 },
    { name: 'Ushers', rate: 91 },
  ],
  atRiskMembers: [
    { name: 'Julian Casablancas', reason: 'Missed 3 consecutive weeks', rate: 42 },
    { name: 'Marcus Aurelius', reason: 'Monthly drop detected', rate: 68 },
  ],
  birthdaysThisWeek: ['Marcus Thorne', 'Elena Rodriguez', 'David Chen'],
  nextBirthday: { name: 'Marcus Thorne', when: 'Tomorrow' },
};
