// ============================================================
// QuickCheck — Display Constants
// ============================================================
// Human-readable labels and category maps for UI rendering.
// Keep types in `@/lib/types` — this file is display-only.
// ============================================================

import type { Event, AbsenceReport } from '../lib/types';

// ─── Event Type Labels ───────────────────────────────────

export const EVENT_TYPE_LABELS: Record<Event['event_type'], string> = {
  sunday_service: 'Sunday Service',
  prayer_meeting: 'Prayer Meeting',
  special_event: 'Special Event',
  general_assembly: 'General Assembly',
  other: 'Other',
};

// ─── Absence Reason Labels ───────────────────────────────

export const REASON_CATEGORIES: Record<AbsenceReport['reason_category'], string> = {
  health: 'Health',
  work: 'Work',
  family: 'Family',
  travel: 'Travel',
  no_response: 'No Resp.',
  other: 'Other',
};
