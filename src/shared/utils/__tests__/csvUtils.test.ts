// csvUtils unit tests — pure logic, no dependencies
import { membersToCSV, parseCSVMembers, eventsToCSV } from '../csvUtils';
import type { Member } from '../../../core/types/domain';

// ─── Helpers ─────────────────────────────────────────────

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`FAIL: ${msg}`);
}

function assertEq<T>(a: T, b: T, msg: string): void {
  if (a !== b) throw new Error(`FAIL: ${msg}\n  expected: ${JSON.stringify(b)}\n  got:      ${JSON.stringify(a)}`);
}

// ─── membersToCSV ────────────────────────────────────────

function test_membersToCSV_basic(): void {
  const members: Member[] = [{
    id: 'm-001', local_id: 'l-001', full_name: 'John Doe',
    contact_number: '555-1234', birthday: '1990-01-15',
    member_since: '2020-03-01', role_in_church: 'Youth Leader',
    ministry_group: 'Youth Ministry', status: 'active',
    attendance_rate: 94, latest_status: 'present',
    photo_url: null, emergency_contact: null, user_id: null,
    created_at: '', updated_at: '', ministry_group_id: null,
  }];

  const csv = membersToCSV(members);
  const lines = csv.split('\n');

  assert(lines.length === 2, 'should have header + 1 row');
  assert(lines[0].startsWith('id,full_name'), 'should have correct headers');
  assert(lines[1].includes('John Doe'), 'should contain member name');
  assert(lines[1].includes('555-1234'), 'should contain contact');
  assert(lines[1].includes('Youth Ministry'), 'should contain ministry group');
  assert(lines[1].includes('active'), 'should contain status');
  assert(lines[1].includes('94'), 'should contain attendance rate');
}

function test_membersToCSV_escapes_commas(): void {
  const members: Member[] = [{
    id: 'm-002', local_id: 'l-001', full_name: 'Doe, Jane',
    contact_number: null, birthday: null, member_since: null,
    role_in_church: null, ministry_group: 'Choir, & Worship',
    status: 'active', attendance_rate: 88, latest_status: 'present',
    photo_url: null, emergency_contact: null, user_id: null,
    created_at: '', updated_at: '', ministry_group_id: null,
  }];

  const csv = membersToCSV(members);
  assert(csv.includes('"Doe, Jane"'), 'should escape comma in name');
  assert(csv.includes('"Choir, & Worship"'), 'should escape comma in ministry group');
}

function test_membersToCSV_handles_null_fields(): void {
  const members: Member[] = [{
    id: 'm-003', local_id: 'l-001', full_name: 'Bob',
    contact_number: null, birthday: null, member_since: null,
    role_in_church: null, ministry_group: null,
    status: 'inactive', attendance_rate: 0,
    photo_url: null, emergency_contact: null, user_id: null,
    created_at: '', updated_at: '', ministry_group_id: null,
  }];

  const csv = membersToCSV(members);
  const row = csv.split('\n')[1];
  // Should not crash — just verify it produces a valid row
  assert(row.length > 0, 'should produce a valid row with null fields');
  assert(row.includes('Bob'), 'should contain name');
}

// ─── parseCSVMembers ─────────────────────────────────────

function test_parseCSVMembers_basic(): void {
  const csv = `full_name,contact_number,status\nJohn Doe,555-1234,active\nJane Smith,555-5678,inactive`;

  const parsed = parseCSVMembers(csv);

  assertEq(parsed.length, 2, 'should parse 2 members');
  assertEq(parsed[0].full_name, 'John Doe', 'should parse first name');
  assertEq(parsed[1].full_name, 'Jane Smith', 'should parse second name');
  assertEq(parsed[0].contact_number, '555-1234', 'should parse contact');
  assertEq(parsed[0].status, 'active', 'should parse status');
  assertEq(parsed[1].status, 'inactive', 'should parse second status');
}

function test_parseCSVMembers_skips_empty_rows(): void {
  const csv = `full_name,status\n\n\nJohn Doe,active\n\n`;

  const parsed = parseCSVMembers(csv);

  assertEq(parsed.length, 1, 'should only return valid rows');
  assertEq(parsed[0].full_name, 'John Doe', 'should find the one valid row');
}

function test_parseCSVMembers_handles_quoted_fields(): void {
  const csv = `full_name,ministry_group\n"Doe, Jane","Choir, & Worship"`;

  const parsed = parseCSVMembers(csv);

  assertEq(parsed.length, 1, 'should parse 1 member');
  assertEq(parsed[0].full_name, 'Doe, Jane', 'should handle quoted comma in name');
  assertEq(parsed[0].ministry_group, 'Choir, & Worship', 'should handle quoted comma in group');
}

function test_parseCSVMembers_empty_input(): void {
  assertEq(parseCSVMembers('').length, 0, 'should return empty for empty string');
  assertEq(parseCSVMembers('full_name\n').length, 0, 'should return empty for header-only');
}

function test_parseCSVMembers_handles_alternate_header(): void {
  const csv = `name,contact_number\nAlice,111-2222`;

  const parsed = parseCSVMembers(csv);
  assertEq(parsed.length, 1, 'should parse with "name" header');
  assertEq(parsed[0].full_name, 'Alice', 'should map name to full_name');
}

// ─── eventsToCSV ─────────────────────────────────────────

function test_eventsToCSV_basic(): void {
  const events: any[] = [{
    id: 'e-001', name: 'Sunday Service', event_type: 'sunday_service',
    date: '2026-06-21', time: '09:00', location: 'Main Hall',
    is_recurring: true, recurrence_rule: 'FREQ=WEEKLY',
    ministry_group_id: null, expected_count: 150,
  }];

  const csv = eventsToCSV(events);
  const lines = csv.split('\n');

  assert(lines.length === 2, 'should have header + 1 row');
  assert(lines[0].includes('event_type'), 'should have event_type header');
  assert(lines[1].includes('Sunday Service'), 'should contain event name');
  assert(lines[1].includes('true'), 'should contain is_recurring');
  assert(lines[1].includes('FREQ=WEEKLY'), 'should contain recurrence rule');
  assert(lines[1].includes('150'), 'should contain expected count');
}

// ─── Run ─────────────────────────────────────────────────

export function runCSVUtilsTests(): { passed: number; failed: number } {
  const tests = [
    test_membersToCSV_basic,
    test_membersToCSV_escapes_commas,
    test_membersToCSV_handles_null_fields,
    test_parseCSVMembers_basic,
    test_parseCSVMembers_skips_empty_rows,
    test_parseCSVMembers_handles_quoted_fields,
    test_parseCSVMembers_empty_input,
    test_parseCSVMembers_handles_alternate_header,
    test_eventsToCSV_basic,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      test();
      passed++;
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      failed++;
    }
  }

  return { passed, failed };
}

