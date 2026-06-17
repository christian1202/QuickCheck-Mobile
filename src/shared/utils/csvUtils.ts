// ============================================================
// QuickCheck — CSV Export/Import Utilities
// ============================================================
// Converts WatermelonDB data to/from CSV format.
// No external dependencies required.
// ============================================================

import type { Member, Event, AttendanceRecord } from '../../core/types/domain';

// ─── Export Helpers ─────────────────────────────────────

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

/**
 * Converts member array to CSV string.
 */
export function membersToCSV(members: Member[]): string {
  const headers = [
    'id', 'first_name', 'last_name', 'contact_number', 'address', 'google_maps_link', 'birthday', 'member_since',
    'role_in_church', 'ministry_group', 'status', 'attendance_rate',
  ];
  const rows = members.map(m => [
    escapeCSV(m.id),
    escapeCSV(m.first_name),
    escapeCSV(m.last_name),
    escapeCSV(m.contact_number),
    escapeCSV(m.address),
    escapeCSV(m.google_maps_link),
    formatDate(m.birthday),
    formatDate(m.member_since),
    escapeCSV(m.role_in_church),
    escapeCSV(m.ministry_group),
    escapeCSV(m.status),
    escapeCSV(m.attendance_rate),
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Converts event array to CSV string.
 */
export function eventsToCSV(events: Event[]): string {
  const headers = [
    'id', 'name', 'event_type', 'date', 'time', 'location',
    'is_recurring', 'recurrence_rule', 'ministry_group_id', 'expected_count',
  ];
  const rows = events.map(e => [
    escapeCSV(e.id),
    escapeCSV(e.name),
    escapeCSV(e.event_type),
    formatDate(e.date),
    escapeCSV(e.time),
    escapeCSV(e.location),
    escapeCSV(e.is_recurring ? 'true' : 'false'),
    escapeCSV(e.recurrence_rule),
    escapeCSV(e.ministry_group_id),
    escapeCSV(e.expected_count),
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Converts attendance records to CSV string.
 */
export function attendanceToCSV(records: AttendanceRecord[]): string {
  const headers = ['id', 'event_id', 'member_id', 'status', 'minutes_late', 'marked_by', 'marked_at'];
  const rows = records.map(r => [
    escapeCSV(r.id),
    escapeCSV(r.event_id),
    escapeCSV(r.member_id),
    escapeCSV(r.status),
    escapeCSV(r.minutes_late),
    escapeCSV(r.marked_by),
    formatDate(r.marked_at),
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generates a full export CSV with all data types.
 */
export function fullExportCSV(
  members: Member[],
  events: Event[],
  records: AttendanceRecord[],
): string {
  return [
    '# QuickCheck Data Export',
    `# Generated: ${new Date().toISOString()}`,
    '',
    '--- MEMBERS ---',
    membersToCSV(members),
    '',
    '--- EVENTS ---',
    eventsToCSV(events),
    '',
    '--- ATTENDANCE ---',
    attendanceToCSV(records),
  ].join('\n');
}

// ─── Import Helpers ─────────────────────────────────────

/**
 * Parses a CSV string into an array of objects keyed by header.
 */
function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n').filter(l => l.trim() && !l.startsWith('#'));
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { current += '"'; i++; }
          else inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { result.push(current); current = ''; }
        else { current += ch; }
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (values[i] ?? '').trim(); });
    return obj;
  });
}

/**
 * Parses a CSV string exported by membersToCSV back into member objects.
 * Only populates fields present in the standard export format.
 */
export function parseCSVMembers(csv: string): Array<{
  first_name: string;
  last_name: string;
  contact_number?: string;
  address?: string;
  google_maps_link?: string;
  birthday?: string;
  member_since?: string;
  role_in_church?: string;
  ministry_group?: string;
  status?: string;
  attendance_rate?: number;
}> {
  const rows = parseCSV(csv);
  return rows.map(row => ({
    first_name: row.first_name || row.full_name?.split(' ')[0] || row.name || '',
    last_name: row.last_name || row.full_name?.split(' ').slice(1).join(' ') || '',
    contact_number: row.contact_number || undefined,
    address: row.address || undefined,
    google_maps_link: row.google_maps_link || undefined,
    birthday: row.birthday || undefined,
    member_since: row.member_since || undefined,
    role_in_church: row.role_in_church || undefined,
    ministry_group: row.ministry_group || undefined,
    status: row.status || 'active',
    attendance_rate: row.attendance_rate ? parseInt(row.attendance_rate, 10) : undefined,
  })).filter(m => m.first_name || m.last_name);
}