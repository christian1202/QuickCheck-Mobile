// ============================================================
// QuickCheck — Attendance Store (Zustand)
// ============================================================
// Centralized state for attendance marking (Quick Mark).
//
// Usage:
//   const { marks, counts, markMember, markAllPresent } = useAttendanceStore();
// ============================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AttendanceStatus, Member } from '../../../core/types/domain';
import type { IAttendanceService } from '../../../core/di/container';

export interface AttendanceState {
  // Current marking session
  eventId: string | null;
  marks: Record<string, AttendanceStatus | null>; // memberId -> status
  members: Member[];

  // Computed counts
  counts: {
    present: number;
    late: number;
    absent: number;
    unmarked: number;
  };

  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Actions
  initSession: (eventId: string, members: Member[]) => void;
  markMember: (memberId: string, status: AttendanceStatus) => void;
  markAllPresent: () => void;
  submitAttendance: (service: IAttendanceService) => Promise<void>;
  reset: () => void;
}

function computeCounts(
  marks: Record<string, AttendanceStatus | null>,
  totalMembers: number,
) {
  const values = Object.values(marks);
  return {
    present: values.filter(s => s === 'present').length,
    late: values.filter(s => s === 'late').length,
    absent: values.filter(s => s === 'absent').length,
    unmarked: totalMembers - values.filter(s => s !== null).length,
  };
}

const initialState = {
  eventId: null as string | null,
  marks: {} as Record<string, AttendanceStatus | null>,
  members: [] as Member[],
  counts: { present: 0, late: 0, absent: 0, unmarked: 0 },
  isLoading: false,
  error: null as string | null,
};

export const useAttendanceStore = create<AttendanceState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      initSession: (eventId: string, members: Member[]) => {
        // Initialize all members as unmarked
        const marks: Record<string, AttendanceStatus | null> = {};
        members.forEach(m => { marks[m.id] = null; });

        set({
          eventId,
          members,
          marks,
          counts: computeCounts(marks, members.length),
          isLoading: false,
          error: null,
        });
      },

      markMember: (memberId: string, status: AttendanceStatus) => {
        set(state => {
          const currentStatus = state.marks[memberId];
          // Toggle: if same status is tapped, unmark
          const newStatus = currentStatus === status ? null : status;
          const newMarks = { ...state.marks, [memberId]: newStatus };

          return {
            marks: newMarks,
            counts: computeCounts(newMarks, state.members.length),
          };
        });
      },

      markAllPresent: () => {
        set(state => {
          const newMarks: Record<string, AttendanceStatus | null> = {};
          state.members.forEach(m => { newMarks[m.id] = 'present'; });

          return {
            marks: newMarks,
            counts: computeCounts(newMarks, state.members.length),
          };
        });
      },

      submitAttendance: async (service: IAttendanceService) => {
        const { eventId, marks } = get();
        if (!eventId) throw new Error('No event session initialized');

        set({ isLoading: true, error: null });

        try {
          const marksArray = Object.entries(marks)
            .filter(([, status]) => status !== null)
            .map(([memberId, status]) => ({
              memberId,
              status: status as AttendanceStatus,
            }));

          await service.markAttendance(eventId, marksArray);
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      reset: () => set(initialState),
    }),
    { name: 'attendance-store' },
  ),
);