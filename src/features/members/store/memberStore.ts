// ============================================================
// QuickCheck — Member Store (Zustand)
// ============================================================
// Centralized state management for the Members feature.
// Tracks: member list, loading state, error state, filters, selection.
//
// Usage:
//   const { members, isLoading, fetchMembers } = useMemberStore();
//
// Design decisions:
//   - Uses Zustand with devtools middleware for debugging.
//   - Async actions call services injected via DI.
//   - Filters are stored here so they persist across navigation.
// ============================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Member, MemberStatus, MemberFilters } from '../../../core/types/domain';
import type { IMemberService } from '../../../core/di/container';

// ─── State Shape ───────────────────────────────────────────

export interface MemberState {
  // Data
  members: Member[];
  selectedMember: Member | null;

  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: MemberFilters;

  // Actions
  fetchMembers: (service: IMemberService) => Promise<void>;
  fetchMemberById: (service: IMemberService, id: string) => Promise<void>;
  createMember: (service: IMemberService, data: Member) => Promise<void>;
  updateMember: (service: IMemberService, id: string, data: Partial<Member>) => Promise<void>;
  deleteMember: (service: IMemberService, id: string) => Promise<void>;
  searchMembers: (service: IMemberService, query: string) => Promise<void>;

  // Filter actions
  setFilters: (filters: Partial<MemberFilters>) => void;
  clearFilters: () => void;

  // Selection
  selectMember: (member: Member | null) => void;
  clearSelection: () => void;

  // Reset
  reset: () => void;
}

// ─── Initial State ─────────────────────────────────────────

const initialState = {
  members: [] as Member[],
  selectedMember: null as Member | null,
  isLoading: false,
  error: null as string | null,
  filters: {} as MemberFilters,
};

// ─── Store ─────────────────────────────────────────────────

export const useMemberStore = create<MemberState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ── Data Fetching ──────────────────────────────────

      fetchMembers: async (service: IMemberService) => {
        const { filters } = get();
        set({ isLoading: true, error: null });

        try {
          const members = await service.getMembers(filters) as Member[];
          set({ members, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch members';
          set({ error: message, isLoading: false });
        }
      },

      fetchMemberById: async (service: IMemberService, id: string) => {
        set({ isLoading: true, error: null });

        try {
          const member = await service.getMemberById(id) as Member | null;
          set({ selectedMember: member, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch member';
          set({ error: message, isLoading: false });
        }
      },

      createMember: async (service: IMemberService, data: Member) => {
        set({ isLoading: true, error: null });

        try {
          const newMember = await service.createMember(data) as Member;
          set(state => ({
            members: [...state.members, newMember],
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create member';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateMember: async (service: IMemberService, id: string, data: Partial<Member>) => {
        set({ isLoading: true, error: null });

        try {
          const updated = await service.updateMember(id, data) as Member;
          set(state => ({
            members: state.members.map(m => (m.id === id ? updated : m)),
            selectedMember: state.selectedMember?.id === id ? updated : state.selectedMember,
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update member';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      deleteMember: async (service: IMemberService, id: string) => {
        set({ isLoading: true, error: null });

        try {
          await service.deleteMember(id);
          set(state => ({
            members: state.members.filter(m => m.id !== id),
            selectedMember: state.selectedMember?.id === id ? null : state.selectedMember,
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete member';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      searchMembers: async (service: IMemberService, query: string) => {
        set({ isLoading: true, error: null });

        try {
          const members = await service.searchMembers(query) as Member[];
          set({ members, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Search failed';
          set({ error: message, isLoading: false });
        }
      },

      // ── Filters ────────────────────────────────────────

      setFilters: (filters: Partial<MemberFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      // ── Selection ──────────────────────────────────────

      selectMember: (member: Member | null) => {
        set({ selectedMember: member });
      },

      clearSelection: () => {
        set({ selectedMember: null });
      },

      // ── Reset ──────────────────────────────────────────

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'member-store' },
  ),
);