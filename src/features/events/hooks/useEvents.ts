// ============================================================
// QuickCheck — useEvents Hook
// ============================================================
import { useCallback, useEffect } from 'react';
import { useDI } from '../../../core/di/container';
import { useEventStore } from '../store/eventStore';
import type { Event, EventFilters } from '../../../core/types/domain';

export function useEvents() {
  const { eventService, logger } = useDI();
  const store = useEventStore();

  useEffect(() => {
    logger.debug('useEvents', 'Auto-fetching events');
    store.fetchEvents(eventService);
  }, [store.filters]);

  const fetchEvents = useCallback(() =>
    store.fetchEvents(eventService), [eventService]);
  const fetchEventById = useCallback((id: string) =>
    store.fetchEventById(eventService, id), [eventService]);
  const createEvent = useCallback(async (data: Event) => {
    logger.info('useEvents', 'Creating event', { name: data.name });
    return store.createEvent(eventService, data);
  }, [eventService]);
  const updateEvent = useCallback(async (id: string, data: Partial<Event>) => {
    logger.info('useEvents', 'Updating event', { id });
    return store.updateEvent(eventService, id, data);
  }, [eventService]);
  const deleteEvent = useCallback(async (id: string) => {
    logger.info('useEvents', 'Deleting event', { id });
    return store.deleteEvent(eventService, id);
  }, [eventService]);
  const setFilters = useCallback((filters: Partial<EventFilters>) =>
    store.setFilters(filters), []);
  const clearFilters = useCallback(() => store.clearFilters(), []);

  return {
    events: store.events,
    selectedEvent: store.selectedEvent,
    filters: store.filters,
    isLoading: store.isLoading,
    error: store.error,
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    setFilters,
    clearFilters,
    selectEvent: store.selectEvent,
  };
}