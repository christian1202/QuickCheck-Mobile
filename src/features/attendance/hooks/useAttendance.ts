// ============================================================
// QuickCheck — useAttendance Hook
// ============================================================
import { useCallback } from 'react';
import { useDI } from '../../../core/di/container';
import { useAttendanceStore } from '../store/attendanceStore';
import type { AttendanceStatus, Member } from '../../../core/types/domain';

export function useAttendance() {
  const { attendanceService, logger } = useDI();
  const store = useAttendanceStore();

  const initSession = useCallback((eventId: string, members: Member[]) => {
    logger.info('useAttendance', 'Initializing attendance session', { eventId, memberCount: members.length });
    store.initSession(eventId, members);
  }, []);

  const markMember = useCallback((memberId: string, status: AttendanceStatus) => {
    store.markMember(memberId, status);
  }, []);

  const markAllPresent = useCallback(() => {
    logger.info('useAttendance', 'Marking all present');
    store.markAllPresent();
  }, []);

  const submitAttendance = useCallback(async () => {
    logger.info('useAttendance', 'Submitting attendance', { eventId: store.eventId });
    return store.submitAttendance(attendanceService);
  }, [attendanceService, store.eventId]);

  const reset = useCallback(() => {
    store.reset();
  }, []);

  return {
    eventId: store.eventId,
    marks: store.marks,
    members: store.members,
    counts: store.counts,
    isLoading: store.isLoading,
    error: store.error,
    initSession,
    markMember,
    markAllPresent,
    submitAttendance,
    reset,
  };
}