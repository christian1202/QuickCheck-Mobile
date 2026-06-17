// eventService recurrence helpers — unit tests
// Pure logic tests — no WatermelonDB dependency.
import { describe, test, expect } from '@jest/globals';

// ─── Inline Recurrence Helpers (copied from eventService.ts) ─

type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval?: number;
  count?: number;
  until?: string;
}

function generateRecurrenceRule(config: RecurrenceConfig): string {
  const parts: string[] = [`FREQ=${config.frequency.toUpperCase()}`];
  if (config.interval && config.interval > 1) parts.push(`INTERVAL=${config.interval}`);
  if (config.count) parts.push(`COUNT=${config.count}`);
  if (config.until) parts.push(`UNTIL=${config.until.replace(/-/g, '')}T235959Z`);
  return parts.join(';');
}

function parseRecurrenceRule(rule: string): RecurrenceConfig | null {
  try {
    const parts = rule.split(';');
    const freqPart = parts.find(p => p.startsWith('FREQ='));
    if (!freqPart) return null;
    const frequency = freqPart.slice(5).toLowerCase() as RecurrenceFrequency;
    const intervalPart = parts.find(p => p.startsWith('INTERVAL='));
    const countPart = parts.find(p => p.startsWith('COUNT='));
    const untilPart = parts.find(p => p.startsWith('UNTIL='));
    return {
      frequency,
      interval: intervalPart ? parseInt(intervalPart.slice(9), 10) : undefined,
      count: countPart ? parseInt(countPart.slice(6), 10) : undefined,
      until: untilPart ? untilPart.slice(6, 14).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : undefined,
    };
  } catch {
    return null;
  }
}

function expandRecurringDates(
  startDate: string,
  rule: string,
  maxOccurrences = 12,
): string[] {
  const config = parseRecurrenceRule(rule);
  if (!config) return [];

  const dates: string[] = [];
  let current = new Date(startDate);
  const limit = config.count ?? maxOccurrences;
  const until = config.until ? new Date(config.until) : null;

  for (let i = 0; i < limit; i++) {
    if (i > 0) {
      switch (config.frequency) {
        case 'daily':
          current = new Date(current.getTime() + (config.interval ?? 1) * 86400000);
          break;
        case 'weekly':
          current = new Date(current.getTime() + (config.interval ?? 1) * 7 * 86400000);
          break;
        case 'monthly':
          current = new Date(current);
          current.setMonth(current.getMonth() + (config.interval ?? 1));
          break;
      }
    }
    if (until && current > until) break;
    const dateStr = current.toISOString().split('T')[0];
    if (dateStr !== startDate) dates.push(dateStr);
  }
  return dates;
}

// ─── generateRecurrenceRule ───────────────────────────────

describe('generateRecurrenceRule', () => {
  test('generates weekly rule', () => {
    expect(generateRecurrenceRule({ frequency: 'weekly' })).toBe('FREQ=WEEKLY');
  });

  test('generates daily rule with interval', () => {
    expect(generateRecurrenceRule({ frequency: 'daily', interval: 3 }))
      .toBe('FREQ=DAILY;INTERVAL=3');
  });

  test('generates monthly rule with count', () => {
    expect(generateRecurrenceRule({ frequency: 'monthly', count: 12 }))
      .toBe('FREQ=MONTHLY;COUNT=12');
  });

  test('generates rule with until date', () => {
    expect(generateRecurrenceRule({ frequency: 'weekly', until: '2026-12-31' }))
      .toBe('FREQ=WEEKLY;UNTIL=20261231T235959Z');
  });
});

// ─── parseRecurrenceRule ──────────────────────────────────

describe('parseRecurrenceRule', () => {
  test('parses weekly rule', () => {
    const c = parseRecurrenceRule('FREQ=WEEKLY');
    expect(c).not.toBeNull();
    expect(c!.frequency).toBe('weekly');
  });

  test('parses daily rule with interval', () => {
    const c = parseRecurrenceRule('FREQ=DAILY;INTERVAL=3');
    expect(c).not.toBeNull();
    expect(c!.interval).toBe(3);
  });

  test('returns null for invalid rule', () => {
    expect(parseRecurrenceRule('INVALID')).toBeNull();
    expect(parseRecurrenceRule('')).toBeNull();
  });
});

// ─── expandRecurringDates ─────────────────────────────────

describe('expandRecurringDates', () => {
  test('expands weekly recurrence', () => {
    const dates = expandRecurringDates('2026-06-01', 'FREQ=WEEKLY', 4);
    expect(dates.length).toBe(3);
    expect(dates[0]).toBe('2026-06-08');
    expect(dates[1]).toBe('2026-06-15');
  });

  test('respects COUNT limit', () => {
    const dates = expandRecurringDates('2026-06-01', 'FREQ=WEEKLY;COUNT=3');
    expect(dates.length).toBe(2);
  });

  test('respects UNTIL limit', () => {
    const dates = expandRecurringDates('2026-06-15', 'FREQ=WEEKLY;UNTIL=20260630T235959Z');
    expect(dates.length).toBe(2);
    expect(dates[0]).toBe('2026-06-22');
    expect(dates[1]).toBe('2026-06-29');
  });

  test('returns empty for invalid rule', () => {
    expect(expandRecurringDates('2026-06-01', 'INVALID').length).toBe(0);
  });

  test('expands monthly recurrence', () => {
    const dates = expandRecurringDates('2026-01-15', 'FREQ=MONTHLY', 4);
    expect(dates.length).toBe(3);
    expect(dates[0]).toBe('2026-02-15');
    expect(dates[1]).toBe('2026-03-15');
  });
});