import { IVisitationService } from '../../../core/di/container';
import { Member, AttendanceRecord } from '../../../core/types/domain';
import { membersCollection, attendanceRecordsCollection } from '../../../core/database';
import { logger } from '../../../core/logging/logger';
import { Q } from '@nozbe/watermelondb';

export function createVisitationService(): IVisitationService {
  return {
    async getMembersNeedingVisitation(consecutiveAbsenceThreshold: number): Promise<Array<{ memberId: string; absences: number; member: Member }>> {
      logger.debug('VisitationService', 'Fetching members needing visitation', { threshold: consecutiveAbsenceThreshold });
      
      try {
        // Only consider active members
        const activeMembers = await membersCollection.query(Q.where('status', 'active')).fetch();
        const results: Array<{ memberId: string; absences: number; member: Member }> = [];

        for (const member of activeMembers) {
          // Fetch attendance records for this member
          const records = await attendanceRecordsCollection.query(
            Q.where('member_id', member.id)
          ).fetch();

          // If they have no records, they can't be consecutively absent
          if (records.length === 0) continue;

          // We need to sort records by event date descending.
          // Since AttendanceRecordModel doesn't have the date directly, we must join with EventModel or fetch the event.
          // For local-first performance, we can fetch all related events or use the event dates.
          const events = await Promise.all(records.map(r => r.event.fetch()));
          
          const recordsWithDate = records.map((r, i) => ({
            record: r,
            date: events[i].date,
            time: events[i].time || '00:00'
          })).sort((a, b) => {
            // Sort by date DESC, then time DESC
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.time.localeCompare(a.time);
          });

          // Count consecutive absences from the most recent event backwards
          let consecutiveAbsences = 0;
          for (const item of recordsWithDate) {
            if (item.record.status === 'absent') {
              consecutiveAbsences++;
            } else if (item.record.status === 'present' || item.record.status === 'late') {
              // Break the streak if they attended
              break;
            }
            // If excused, we might break the streak or ignore it. Let's assume an excused absence
            // still means they weren't physically there, but maybe doesn't trigger a member care visit.
            // For now, let's treat excused as 'not an unexcused absence' and break the streak.
            // Actually, the app only supports 'present', 'late', 'absent' natively in quick mark.
          }

          if (consecutiveAbsences >= consecutiveAbsenceThreshold) {
            results.push({
              memberId: member.id,
              absences: consecutiveAbsences,
              member: member as unknown as Member,
            });
          }
        }

        // Sort results by most absences first
        results.sort((a, b) => b.absences - a.absences);

        logger.info('VisitationService', `Found ${results.length} members needing visitation`);
        return results;

      } catch (error) {
        logger.error('VisitationService', 'Failed to calculate visitation needs', error instanceof Error ? error : undefined);
        return [];
      }
    }
  };
}
