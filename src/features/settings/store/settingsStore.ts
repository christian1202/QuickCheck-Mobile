// ============================================================
// QuickCheck — Settings Store (Zustand)
// ============================================================
// Persists app configuration: theme, notifications, thresholds.
//
// Usage:
//   const { darkMode, toggleDarkMode, atRiskThreshold } = useSettingsStore();
// ============================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface SettingsState {
  // Appearance
  darkMode: boolean;

  // Notifications
  preEventReminders: boolean;
  reminderTiming: string; // e.g., '30 min before', '1 hour before'
  absenceUpdates: boolean;

  // Attendance Logic
  atRiskThreshold: number; // 0–100
  consecutiveAbsenceAlert: number; // count

  // Actions
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  setPreEventReminders: (enabled: boolean) => void;
  setReminderTiming: (timing: string) => void;
  setAbsenceUpdates: (enabled: boolean) => void;
  setAtRiskThreshold: (threshold: number) => void;
  setConsecutiveAbsenceAlert: (count: number) => void;
  reset: () => void;
}

const initialState = {
  darkMode: false,
  preEventReminders: true,
  reminderTiming: '30 min before',
  absenceUpdates: true,
  atRiskThreshold: 70,
  consecutiveAbsenceAlert: 3,
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
        setDarkMode: (enabled: boolean) => set({ darkMode: enabled }),
        setPreEventReminders: (enabled: boolean) => set({ preEventReminders: enabled }),
        setReminderTiming: (timing: string) => set({ reminderTiming: timing }),
        setAbsenceUpdates: (enabled: boolean) => set({ absenceUpdates: enabled }),
        setAtRiskThreshold: (threshold: number) => {
          const clamped = Math.max(0, Math.min(100, threshold));
          set({ atRiskThreshold: clamped });
        },
        setConsecutiveAbsenceAlert: (count: number) => {
          const clamped = Math.max(1, Math.min(10, count));
          set({ consecutiveAbsenceAlert: clamped });
        },
        reset: () => set(initialState),
      }),
      { name: 'settings-store' },
    ),
    { name: 'settings-store' },
  ),
);