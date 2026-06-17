// csvUtils unit tests — pure logic, no dependencies
import { describe, test, expect } from '@jest/globals';
import { membersToCSV, parseCSVMembers, eventsToCSV } from '../csvUtils';
import type { Member } from '../../../core/types/domain';

// ─── membersToCSV ────────────────────────────────────────

describe('membersToCSV', () => {
  test('basic export with all fields', () => {
    const members: Member[] = [{
      id: 'm-001', local_id: 'l-001', first_name: 'John', last_name: 'Doe',
      contact_number: '555-1234', address: '123 Fake St', google_maps_link: null, birthday: '1990-01-15',
      member_since: '2020-03-01', role_in_church: 'Youth Leader',
      ministry_group: 'Youth Ministry', status: 'active',
      attendance_rate: 94, latest_status: 'present',
      photo_url: null, emergency_contact: null, user_id: null,
      created_at: '', updated_at: '', ministry_group_id: null,
    }];

    const csv = membersToCSV(members);
    const lines = csv.split('\n');

    expect(lines.length).toBe(2);
    expect(lines[0]).toMatch(/^id,first_name,last_name/);
    expect(lines[1]).toContain('John');
    expect(lines[1]).toContain('Doe');
    expect(lines[1]).toContain('555-1234');
    expect(lines[1]).toContain('Youth Ministry');
    expect(lines[1]).toContain('active');
    expect(lines[1]).toContain('94');
  });

  test('escapes commas in fields', () => {
    const members: Member[] = [{
      id: 'm-002', local_id: 'l-001', first_name: 'Jane', last_name: 'Doe, Jr.',
      contact_number: null, address: null, google_maps_link: null, birthday: null, member_since: null,
      role_in_church: null, ministry_group: 'Choir, & Worship',
      status: 'active', attendance_rate: 88, latest_status: 'present',
      photo_url: null, emergency_contact: null, user_id: null,
      created_at: '', updated_at: '', ministry_group_id: null,
    }];

    const csv = membersToCSV(members);
    expect(csv).toContain('"Doe, Jr."');
    expect(csv).toContain('"Choir, & Worship"');
  });

  test('handles null fields gracefully', () => {
    const members: Member[] = [{
      id: 'm-003', local_id: 'l-001', first_name: 'Bob', last_name: '',
      contact_number: null, address: null, google_maps_link: null, birthday: null, member_since: null,
      role_in_church: null, ministry_group: null,
      status: 'inactive', attendance_rate: 0,
      photo_url: null, emergency_contact: null, user_id: null,
      created_at: '', updated_at: '', ministry_group_id: null,
    }];

    const csv = membersToCSV(members);
    const row = csv.split('\n')[1];
    expect(row.length).toBeGreaterThan(0);
    expect(row).toContain('Bob');
  });
});

// ─── parseCSVMembers ─────────────────────────────────────

describe('parseCSVMembers', () => {
  test('parses basic member CSV', () => {
    const csv = `first_name,last_name,contact_number,status\nJohn,Doe,555-1234,active\nJane,Smith,555-5678,inactive`;

    const parsed = parseCSVMembers(csv);

    expect(parsed.length).toBe(2);
    expect(parsed[0].first_name).toBe('John');
    expect(parsed[0].last_name).toBe('Doe');
    expect(parsed[1].first_name).toBe('Jane');
    expect(parsed[1].last_name).toBe('Smith');
    expect(parsed[0].contact_number).toBe('555-1234');
    expect(parsed[0].status).toBe('active');
    expect(parsed[1].status).toBe('inactive');
  });

  test('skips empty rows', () => {
    const csv = `first_name,last_name,status\n\n\nJohn,Doe,active\n\n`;

    const parsed = parseCSVMembers(csv);

    expect(parsed.length).toBe(1);
    expect(parsed[0].first_name).toBe('John');
    expect(parsed[0].last_name).toBe('Doe');
  });

  test('handles quoted fields with commas', () => {
    const csv = `first_name,last_name,ministry_group\n"Jane","Doe, Jr.","Choir, & Worship"`;

    const parsed = parseCSVMembers(csv);

    expect(parsed.length).toBe(1);
    expect(parsed[0].first_name).toBe('Jane');
    expect(parsed[0].last_name).toBe('Doe, Jr.');
    expect(parsed[0].ministry_group).toBe('Choir, & Worship');
  });

  test('returns empty array for empty input', () => {
    expect(parseCSVMembers('').length).toBe(0);
    expect(parseCSVMembers('first_name,last_name\n').length).toBe(0);
  });

  test('maps alternate "name" header to first_name', () => {
    const csv = `name,contact_number\nAlice,111-2222`;

    const parsed = parseCSVMembers(csv);
    expect(parsed.length).toBe(1);
    expect(parsed[0].first_name).toBe('Alice');
  });
});

// ─── eventsToCSV ─────────────────────────────────────────

describe('eventsToCSV', () => {
  test('converts events to CSV format', () => {
    const events: any[] = [{
      id: 'e-001', name: 'Sunday Service', event_type: 'sunday_service',
      date: '2026-06-21', time: '09:00', location: 'Main Hall',
      is_recurring: true, recurrence_rule: 'FREQ=WEEKLY',
      ministry_group_id: null, expected_count: 150,
    }];

    const csv = eventsToCSV(events);
    const lines = csv.split('\n');

    expect(lines.length).toBe(2);
    expect(lines[0]).toContain('event_type');
    expect(lines[1]).toContain('Sunday Service');
    expect(lines[1]).toContain('true');
    expect(lines[1]).toContain('FREQ=WEEKLY');
    expect(lines[1]).toContain('150');
  });
});