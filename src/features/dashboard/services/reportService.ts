// ============================================================
// QuickCheck — Report / Dashboard Service
// ============================================================
// Handles dashboard aggregations and report exports.
// Reads from WatermelonDB to compute real-time stats.
// ============================================================

import type { IReportService } from '../../../core/di/container';
import type { DashboardData, Member, AttendanceRecord } from '../../../core/types/domain';
import { membersCollection, attendanceRecordsCollection, eventsCollection } from '../../../core/database';
import { logger } from '../../../core/logging/logger';
import { Q } from '@nozbe/watermelondb';

export function createReportService(): IReportService {
  return {
    async getDashboardData(): Promise<DashboardData> {
      logger.debug('ReportService', 'Computing dashboard data');

      const members = await membersCollection.query().fetch() as unknown as Member[];
      const attendance = await attendanceRecordsCollection.query().fetch() as unknown as AttendanceRecord[];
      const events = await eventsCollection.query().fetch();

      const activeMembers = members.filter((m) => m.status === 'active').length;

      // Compute monthly average attendance
      const totalRecords = attendance.length;
      const presentCount = attendance.filter((a) => a.status === 'present').length;
      const monthlyAvg = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

      // Status distribution
      const statusDistribution = {
        present: attendance.filter((a) => a.status === 'present').length,
        late: attendance.filter((a) => a.status === 'late').length,
        absent: attendance.filter((a) => a.status === 'absent').length,
      };

      // Ministry groups (from members)
      const groupMap = new Map<string, { count: number; rate: number }>();
      members.forEach((m) => {
        const group = m.ministry_group || 'Unassigned';
        const current = groupMap.get(group) || { count: 0, rate: 0 };
        current.count++;
        current.rate = m.attendance_rate || 0;
        groupMap.set(group, current);
      });
      const ministryGroups = Array.from(groupMap.entries()).map(([name, data]) => ({
        name,
        rate: data.rate,
      }));

      // At-risk members (attendance rate < 70%)
      const atRiskMembers = members
        .filter((m) => (m.attendance_rate || 100) < 70)
        .slice(0, 5)
        .map((m) => ({
          name: m.full_name,
          reason: (m.attendance_rate || 0) < 50 ? 'Very low attendance' : 'Below threshold',
          rate: m.attendance_rate || 0,
        }));

      // Birthdays this week
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const birthdaysThisWeek = members
        .filter((m) => {
          if (!m.birthday) return false;
          const bday = new Date(m.birthday);
          const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
          return thisYear >= today && thisYear <= weekFromNow;
        })
        .map((m) => m.full_name);

      const nextBirthday = birthdaysThisWeek.length > 0
        ? { name: birthdaysThisWeek[0], when: 'This week' }
        : { name: 'None', when: '' };

      // Compute membersTrend (active members created in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const membersTrend = (members as any[]).filter((m) => m.status === 'active' && m.createdAt >= thirtyDaysAgo).length;

      // Attendance trend (last 6 months dynamically calculated)
      const trendMonths: string[] = [];
      const attendanceTrend: number[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        trendMonths.push(d.toLocaleDateString('en', { month: 'short' }));
        
        const eventsInMonth = (events as any[]).filter(e => {
          if (!e.date) return false;
          const ed = new Date(e.date);
          return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
        });
        const eventIds = new Set(eventsInMonth.map(e => e.id));
        
        const recordsInMonth = (attendance as any[]).filter(a => eventIds.has(a.eventId || a.event_id));
        if (recordsInMonth.length === 0) {
          attendanceTrend.push(0); // 0% if no events
        } else {
          const pres = recordsInMonth.filter(a => a.status === 'present').length;
          attendanceTrend.push(Math.round((pres / recordsInMonth.length) * 100));
        }
      }

      logger.info('ReportService', 'Dashboard computed', { activeMembers, monthlyAvg });

      return {
        activeMembers,
        membersTrend,
        monthlyAvg: monthlyAvg || 0,
        attendanceTrend,
        trendMonths,
        statusDistribution,
        ministryGroups,
        atRiskMembers,
        birthdaysThisWeek,
        nextBirthday,
      };
    },

    async getMemberReport(memberId: string): Promise<unknown> {
      logger.debug('ReportService', 'Generating member report', { memberId });
      const records = await attendanceRecordsCollection.query(
        Q.where('member_id', memberId)
      ).fetch();
      return {
        memberId,
        totalEvents: records.length,
        present: records.filter((r: any) => r.status === 'present').length,
        late: records.filter((r: any) => r.status === 'late').length,
        absent: records.filter((r: any) => r.status === 'absent').length,
      };
    },

    async getAbsenceReports(filters?: unknown): Promise<unknown[]> {
      logger.debug('ReportService', 'Fetching absence reports', { filters });
      // In a full implementation, this would query the absence_reports table
      return [];
    },

    async exportReport(type: string, filters?: unknown): Promise<string> {
      logger.info('ReportService', 'Exporting report', { type, filters });
      // In a full implementation, this generates CSV/PDF
      return '';
    },
  };
}