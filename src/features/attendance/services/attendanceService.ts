// ============================================================
// QuickCheck — Attendance Service
// ============================================================
// Handles all attendance operations against WatermelonDB.
// ============================================================

import type { IAttendanceService } from '../../../core/di/container';
import type { AttendanceRecord, Member } from '../../../core/types/domain';
import { attendanceRecordsCollection } from '../../../core/database';
import { logger } from '../../../core/logging/logger';
import { Q } from '@nozbe/watermelondb';

export function createAttendanceService(): IAttendanceService {
  return {
    async markAttendance(
      eventId: string,
      marks: Array<{ memberId: string; status: string; minutesLate?: number }>,
    ): Promise<AttendanceRecord[]> {
      logger.info('AttendanceService', 'Marking attendance', { eventId, count: marks.length });
      const created: AttendanceRecord[] = [];

      for (const mark of marks) {
        await attendanceRecordsCollection.create((record: any) => {
          record.event_id = eventId;
          record.member_id = mark.memberId;
          record.status = mark.status;
          record.minutes_late = mark.minutesLate ?? null;
          record.marked_by = null;
          record.marked_at = Date.now();
          record.updated_at = Date.now();
        });
      }

      // Re-fetch all for this event to return consistent state
      const all = await attendanceRecordsCollection.query(
        Q.where('event_id', eventId)
      ).fetch();
      return all as unknown as AttendanceRecord[];
    },

    async getAttendanceForEvent(eventId: string): Promise<AttendanceRecord[]> {
      logger.debug('AttendanceService', 'Fetching attendance for event', { eventId });
      const records = await attendanceRecordsCollection.query(
        Q.where('event_id', eventId)
      ).fetch();
      logger.info('AttendanceService', 'Attendance fetched', { eventId, count: records.length });
      return records as unknown as AttendanceRecord[];
    },

    async getAttendanceForMember(memberId: string): Promise<AttendanceRecord[]> {
      logger.debug('AttendanceService', 'Fetching attendance for member', { memberId });
      const records = await attendanceRecordsCollection.query(
        Q.where('member_id', memberId)
      ).fetch();
      logger.info('AttendanceService', 'Member attendance fetched', { memberId, count: records.length });
      return records as unknown as AttendanceRecord[];
    },
  };
}