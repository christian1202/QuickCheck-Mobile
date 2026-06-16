// ============================================================
// QuickCheck — Production DI Container
// ============================================================
// Wires up all real service implementations. Local-first —
// all data lives in WatermelonDB on device.
// No cloud dependency. No Supabase.
//
// For testing, use createMockContainer() from core/di/container.ts
// ============================================================

// eslint-disable-next-line no-var
declare var __DEV__: boolean;

import { logger } from '../core/logging/logger';
import { networkMonitor } from '../core/monitoring/networkMonitor';
import { createAuthService } from '../features/auth/services/authService';
import type { Dependencies } from '../core/di/container';

// ─── Services ───────────────────────────────────────────────

const authService = createAuthService();

// Stubs for features not yet migrated to WatermelonDB services.
// Each will be replaced with a real implementation importing
// from its feature folder (memberService.ts, eventService.ts, etc.)

const memberService: Dependencies['memberService'] = {
  getMembers: async (_filters) => [],
  getMemberById: async (_id) => null,
  createMember: async (_data) => ({}),
  updateMember: async (_id, _data) => ({}),
  deleteMember: async (_id) => {},
  searchMembers: async (_query) => [],
};

const eventService: Dependencies['eventService'] = {
  getEvents: async (_filters) => [],
  getEventById: async (_id) => null,
  createEvent: async (_data) => ({}),
  updateEvent: async (_id, _data) => ({}),
  deleteEvent: async (_id) => {},
};

const attendanceService: Dependencies['attendanceService'] = {
  markAttendance: async (_eventId, _marks) => [],
  getAttendanceForEvent: async (_eventId) => [],
  getAttendanceForMember: async (_memberId) => [],
};

const reportService: Dependencies['reportService'] = {
  getDashboardData: async () => ({}),
  getMemberReport: async (_memberId) => ({}),
  getAbsenceReports: async (_filters) => [],
  exportReport: async (_type, _filters) => '',
};

// Sync engine stub (no remote sync in local-first mode)
const syncEngineStub: Dependencies['syncEngine'] = {
  sync: async () => {},
  requestSync: () => {},
  getLastSyncTime: () => null,
  isOnline: () => networkMonitor.isOnline(),
};

// ─── Production Container Factory ──────────────────────────

export function createProductionContainer(): Dependencies {
  return {
    logger,
    authService,
    memberService,
    eventService,
    attendanceService,
    reportService,
    syncEngine: syncEngineStub,
    isDev: __DEV__,
    appVersion: '1.0.0',
  };
}