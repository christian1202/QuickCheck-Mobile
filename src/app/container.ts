// ============================================================
// QuickCheck — Production DI Container
// ============================================================
// Wires up all real service implementations with their
// dependencies. This is the single place where concrete
// implementations are chosen.
//
// For testing, use createMockContainer() from core/di/container.ts
// ============================================================

// eslint-disable-next-line no-var
declare var __DEV__: boolean;

import { logger } from '../core/logging/logger';
import { syncEngine } from '../core/api/syncEngine';
import { networkMonitor } from '../core/monitoring/networkMonitor';
import type { Dependencies } from '../core/di/container';

// ─── Placeholder Services (to be replaced with real implementations) ───

// These stubbed implementations allow the app to compile and run
// while services are built incrementally. Each service will be
// moved to its feature folder and imported here.

const authService: Dependencies['authService'] = {
  login: async (_email, _password) => {
    logger.debug('AuthService', 'login called (stub)');
  },
  logout: async () => {
    logger.debug('AuthService', 'logout called (stub)');
  },
  getCurrentUser: async () => {
    return null;
  },
  isAuthenticated: async () => {
    return false;
  },
};

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

// ─── Sync Engine Adapter ───────────────────────────────────

// Wraps syncEngine for the DI container
const syncEngineAdapter: Dependencies['syncEngine'] = {
  sync: async () => {
    logger.info('SyncEngineAdapter', 'sync requested but sync function not yet wired');
  },
  requestSync: () => {
    syncEngine.requestSync();
  },
  getLastSyncTime: () => syncEngine.getLastSyncTime(),
  isOnline: () => networkMonitor.isOnline(),
};

// ─── Production Container Factory ──────────────────────────

export function createProductionContainer(): Dependencies {
  return {
    // Core infrastructure
    logger,

    // Services
    authService,
    memberService,
    eventService,
    attendanceService,
    reportService,

    // Infrastructure
    syncEngine: syncEngineAdapter,

    // Config
    isDev: __DEV__,
    appVersion: '1.0.0',
  };
}