// eventService recurrence helpers — unit tests
// IMPORTANT: Does NOT import from eventService.ts directly
// to avoid the WatermelonDB native module dependency.
// Tests the pure helper functions in isolation.

// ─── Helpers (assertions) ───────────────────────────────

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`FAIL: ${msg}`);
}

function assertEq<T>(a: T, b: T, msg: string): void {
  if (a !== b && JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`FAIL: ${msg}\n  expected: ${JSON.stringify(b)}\n  got:      ${JSON.stringify(a)}`);
  }
}

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

// ─── Tests ───────────────────────────────────────────────

function test_generateRule_weekly(): void {
  assertEq(generateRecurrenceRule({ frequency: 'weekly' }), 'FREQ=WEEKLY', 'weekly');
}

function test_generateRule_daily_with_interval(): void {
  assertEq(generateRecurrenceRule({ frequency: 'daily', interval: 3 }), 'FREQ=DAILY;INTERVAL=3', 'daily interval 3');
}

function test_generateRule_monthly_with_count(): void {
  assertEq(generateRecurrenceRule({ frequency: 'monthly', count: 12 }), 'FREQ=MONTHLY;COUNT=12', 'monthly count 12');
}

function test_generateRule_with_until(): void {
  assertEq(generateRecurrenceRule({ frequency: 'weekly', until: '2026-12-31' }), 'FREQ=WEEKLY;UNTIL=20261231T235959Z', 'until');
}

function test_parseRule_weekly(): void {
  const c = parseRecurrenceRule('FREQ=WEEKLY');
  assert(c !== null, 'not null');
  assertEq(c!.frequency, 'weekly', 'frequency');
}

function test_parseRule_daily_interval(): void {
  const c = parseRecurrenceRule('FREQ=DAILY;INTERVAL=3');
  assert(c !== null, 'not null');
  assertEq(c!.interval, 3, 'interval');
}

function test_parseRule_invalid(): void {
  assertEq(parseRecurrenceRule('INVALID'), null, 'invalid => null');
  assertEq(parseRecurrenceRule(''), null, 'empty => null');
}

function test_expand_weekly(): void {
  const dates = expandRecurringDates('2026-06-01', 'FREQ=WEEKLY', 4);
  assertEq(dates.length, 3, '3 future dates');
  assertEq(dates[0], '2026-06-08', 'next Mon');
  assertEq(dates[1], '2026-06-15', 'Mon after');
}

function test_expand_count(): void {
  const dates = expandRecurringDates('2026-06-01', 'FREQ=WEEKLY;COUNT=3');
  assertEq(dates.length, 2, 'COUNT=3 => 2 future');
}

function test_expand_until(): void {
  const dates = expandRecurringDates('2026-06-15', 'FREQ=WEEKLY;UNTIL=20260630T235959Z');
  assertEq(dates.length, 2, '2 dates within until');
  assertEq(dates[0], '2026-06-22', 'first');
  assertEq(dates[1], '2026-06-29', 'last within until');
}

function test_expand_invalid(): void {
  assertEq(expandRecurringDates('2026-06-01', 'INVALID').length, 0, 'invalid => empty');
}

function test_expand_monthly(): void {
  const dates = expandRecurringDates('2026-01-15', 'FREQ=MONTHLY', 4);
  assertEq(dates.length, 3, '3 months');
  assertEq(dates[0], '2026-02-15', 'next month');
  assertEq(dates[1], '2026-03-15', 'month after');
}

// ─── Run ─────────────────────────────────────────────────

export function runEventServiceTests(): { passed: number; failed: number } {
  const tests = [
    test_generateRule_weekly,
    test_generateRule_daily_with_interval,
    test_generateRule_monthly_with_count,
    test_generateRule_with_until,
    test_parseRule_weekly,
    test_parseRule_daily_interval,
    test_parseRule_invalid,
    test_expand_weekly,
    test_expand_count,
    test_expand_until,
    test_expand_invalid,
    test_expand_monthly,
  ];

  let passed = 0, failed = 0;
  for (const test of tests) {
    try { test(); passed++; }
    catch (e) { console.error(e instanceof Error ? e.message : String(e)); failed++; }
  }
  return { passed, failed };
}