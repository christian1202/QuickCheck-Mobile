// ============================================================
// QuickCheck — Event Store (Zustand)
// ============================================================
// Centralized state for the Events feature.
//
// Usage:
//   const { events, isLoading, fetchEvents } = useEventStore();
// ============================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Event, EventFilters } from '../../../core/types/domain';
import type { IEventService } from '../../../core/di/container';

export interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  filters: EventFilters;

  fetchEvents: (service: IEventService) => Promise<void>;
  fetchEventById: (service: IEventService, id: string) => Promise<void>;
  createEvent: (service: IEventService, data: Event) => Promise<void>;
  updateEvent: (service: IEventService, id: string, data: Partial<Event>) => Promise<void>;
  deleteEvent: (service: IEventService, id: string) => Promise<void>;
  setFilters: (filters: Partial<EventFilters>) => void;
  clearFilters: () => void;
  selectEvent: (event: Event | null) => void;
  reset: () => void;
}

const initialState = {
  events: [] as Event[],
  selectedEvent: null as Event | null,
  isLoading: false,
  error: null as string | null,
  filters: {} as EventFilters,
};

export const useEventStore = create<EventState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchEvents: async (service: IEventService) => {
        const { filters } = get();
        set({ isLoading: true, error: null });
        try {
          const events = await service.getEvents(filters) as Event[];
          set({ events, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      fetchEventById: async (service: IEventService, id: string) => {
        set({ isLoading: true, error: null });
        try {
          const event = await service.getEventById(id) as Event | null;
          set({ selectedEvent: event, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      createEvent: async (service: IEventService, data: Event) => {
        set({ isLoading: true, error: null });
        try {
          const newEvent = await service.createEvent(data) as Event;
          set(state => ({ events: [...state.events, newEvent], isLoading: false }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      updateEvent: async (service: IEventService, id: string, data: Partial<Event>) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await service.updateEvent(id, data) as Event;
          set(state => ({
            events: state.events.map(e => (e.id === id ? updated : e)),
            selectedEvent: state.selectedEvent?.id === id ? updated : state.selectedEvent,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      deleteEvent: async (service: IEventService, id: string) => {
        set({ isLoading: true, error: null });
        try {
          await service.deleteEvent(id);
          set(state => ({
            events: state.events.filter(e => e.id !== id),
            selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      setFilters: (filters: Partial<EventFilters>) => {
        set(state => ({ filters: { ...state.filters, ...filters } }));
      },

      clearFilters: () => set({ filters: {} }),
      selectEvent: (event: Event | null) => set({ selectedEvent: event }),
      reset: () => set(initialState),
    }),
    { name: 'event-store' },
  ),
);