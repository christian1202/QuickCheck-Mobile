// ============================================================
// QuickCheck — Event Service
// ============================================================
// Handles all event CRUD operations against WatermelonDB.
// Includes recurrence rule generation for recurring events.
// ============================================================

import type { IEventService } from '../../../core/di/container';
import type { Event, EventFilters } from '../../../core/types/domain';
import { eventsCollection } from '../../../core/database';
import { logger } from '../../../core/logging/logger';
import { Q } from '@nozbe/watermelondb';

// ─── Recurrence Helpers ──────────────────────────────────

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval?: number;   // e.g., every 2 weeks
  count?: number;      // total occurrences
  until?: string;      // end date (YYYY-MM-DD)
}

/**
 * Generates an RFC 5545-style recurrence rule string.
 */
export function generateRecurrenceRule(config: RecurrenceConfig): string {
  const parts: string[] = [`FREQ=${config.frequency.toUpperCase()}`];
  if (config.interval && config.interval > 1) parts.push(`INTERVAL=${config.interval}`);
  if (config.count) parts.push(`COUNT=${config.count}`);
  if (config.until) parts.push(`UNTIL=${config.until.replace(/-/g, '')}T235959Z`);
  return parts.join(';');
}

/**
 * Parses a recurrence rule string into config.
 */
export function parseRecurrenceRule(rule: string): RecurrenceConfig | null {
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

/**
 * Generates future event dates from a parent event's recurrence rule.
 * Returns dates for the next 12 occurrences (or fewer if bounded by COUNT/UNTIL).
 */
export function expandRecurringDates(
  startDate: string,     // YYYY-MM-DD
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
    // Advance the date based on frequency
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
    if (dateStr !== startDate) {
      dates.push(dateStr);
    }
  }

  return dates;
}

// ─── Service Implementation ──────────────────────────────

export function createEventService(): IEventService {
  return {
    async getEvents(filters?: EventFilters): Promise<Event[]> {
      logger.debug('EventService', 'Fetching events', { filters });
      const conditions: Q.Clause[] = [];

      if (filters?.eventType) {
        conditions.push(Q.where('event_type', filters.eventType));
      }
      if (filters?.ministryGroupId) {
        conditions.push(Q.where('ministry_group_id', filters.ministryGroupId));
      }

      const records = await eventsCollection.query(...conditions).fetch();
      logger.info('EventService', 'Events fetched', { count: records.length });
      return records as unknown as Event[];
    },

    async getEventById(id: string): Promise<Event | null> {
      logger.debug('EventService', 'Fetching event by id', { id });
      try {
        const record = await eventsCollection.find(id);
        return record as unknown as Event;
      } catch {
        logger.warn('EventService', 'Event not found', { id });
        return null;
      }
    },

    async createEvent(data: Event): Promise<Event> {
      logger.info('EventService', 'Creating event', {
        name: data.name,
        is_recurring: data.is_recurring,
        recurrence_rule: data.recurrence_rule,
      });

      // Create the parent event
      await eventsCollection.create((record: any) => {
        record.local_id = data.local_id;
        record.name = data.name;
        record.event_type = data.event_type;
        record.date = data.date;
        record.time = data.time ?? null;
        record.location = data.location ?? null;
        record.ministry_group_id = data.ministry_group_id ?? null;
        record.is_recurring = data.is_recurring ?? false;
        record.recurrence_rule = data.recurrence_rule ?? null;
        record.template_id = data.template_id ?? null;
        record.created_at = Date.now();
        record.updated_at = Date.now();
      });

      // If recurring, auto-generate future instances
      if (data.is_recurring && data.recurrence_rule && data.date) {
        const futureDates = expandRecurringDates(data.date, data.recurrence_rule);
        logger.info('EventService', 'Generating recurring instances', {
          parent: data.name,
          count: futureDates.length,
          dates: futureDates.slice(0, 5),
        });

        for (const futureDate of futureDates) {
          await eventsCollection.create((record: any) => {
            record.local_id = data.local_id;
            record.name = data.name;
            record.event_type = data.event_type;
            record.date = futureDate;
            record.time = data.time ?? null;
            record.location = data.location ?? null;
            record.ministry_group_id = data.ministry_group_id ?? null;
            record.is_recurring = false;        // children are not recurring themselves
            record.recurrence_rule = null;
            record.template_id = data.template_id ?? null;
            record.created_at = Date.now();
            record.updated_at = Date.now();
          });
        }
      }

      const all = await eventsCollection.query().fetch();
      return all[all.length - 1] as unknown as Event;
    },

    async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
      logger.info('EventService', 'Updating event', { id });
      const record = await eventsCollection.find(id);
      await record.update((r: any) => {
        if (data.name !== undefined) r.name = data.name;
        if (data.event_type !== undefined) r.event_type = data.event_type;
        if (data.date !== undefined) r.date = data.date;
        if (data.time !== undefined) r.time = data.time;
        if (data.location !== undefined) r.location = data.location;
        if (data.ministry_group_id !== undefined) r.ministry_group_id = data.ministry_group_id;
        if (data.is_recurring !== undefined) r.is_recurring = data.is_recurring;
        if (data.recurrence_rule !== undefined) r.recurrence_rule = data.recurrence_rule;
        r.updated_at = Date.now();
      });
      return record as unknown as Event;
    },

    async deleteEvent(id: string): Promise<void> {
      logger.info('EventService', 'Deleting event', { id });
      const record = await eventsCollection.find(id);
      await record.destroyPermanently();
    },
  };
}