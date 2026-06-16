// ============================================================
// QuickCheck — useSettings Hook
// ============================================================
import { useSettingsStore } from '../store/settingsStore';

export function useSettings() {
  const store = useSettingsStore();

  return {
    darkMode: store.darkMode,
    preEventReminders: store.preEventReminders,
    reminderTiming: store.reminderTiming,
    absenceUpdates: store.absenceUpdates,
    atRiskThreshold: store.atRiskThreshold,
    consecutiveAbsenceAlert: store.consecutiveAbsenceAlert,
    toggleDarkMode: store.toggleDarkMode,
    setDarkMode: store.setDarkMode,
    setPreEventReminders: store.setPreEventReminders,
    setReminderTiming: store.setReminderTiming,
    setAbsenceUpdates: store.setAbsenceUpdates,
    setAtRiskThreshold: store.setAtRiskThreshold,
    setConsecutiveAbsenceAlert: store.setConsecutiveAbsenceAlert,
    reset: store.reset,
  };
}