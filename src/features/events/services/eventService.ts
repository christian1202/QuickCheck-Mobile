// ============================================================
// QuickCheck — Event Service
// ============================================================
// Handles all event CRUD operations against WatermelonDB.
// ============================================================

import type { IEventService } from '../../../core/di/container';
import type { Event, EventFilters } from '../../../core/types/domain';
import { eventsCollection } from '../../../core/database';
import { logger } from '../../../core/logging/logger';
import { Q } from '@nozbe/watermelondb';

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
      logger.info('EventService', 'Creating event', { name: data.name });
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