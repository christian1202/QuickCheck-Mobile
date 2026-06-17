// ============================================================
// QuickCheck — Production DI Container
// ============================================================
// Wires up all real service implementations. Local-first —
// all data lives in WatermelonDB on device.
// No cloud dependency. No Supabase.
//
// All services are created here via factory functions and
// passed through the DI container. Screens never import
// services directly — they use hooks which call useDI().
//
// For testing, use createMockContainer() from core/di/container.ts
// ============================================================

// eslint-disable-next-line no-var
declare var __DEV__: boolean;

import { logger } from '../core/logging/logger';
import { networkMonitor } from '../core/monitoring/networkMonitor';
import { createAuthService } from '../features/auth/services/authService';
import { createMemberService } from '../features/members/services/memberService';
import { createEventService } from '../features/events/services/eventService';
import { createAttendanceService } from '../features/attendance/services/attendanceService';
import { createReportService } from '../features/dashboard/services/reportService';
import { createVisitationService } from '../features/visitation/services/visitationService';
import { createGoogleSheetsService } from '../features/export/services/googleSheetsService';
import { createAutoSaveService, setGlobalAutoSave } from '../core/services/autoSaveService';
import type { Dependencies } from '../core/di/container';

// ─── Create Services (each called ONCE) ─────────────────────

const authService = createAuthService();
const memberService = createMemberService();
const eventService = createEventService();
const attendanceService = createAttendanceService();
const reportService = createReportService();
const visitationService = createVisitationService();
const googleSheetsService = createGoogleSheetsService();
const autoSaveService = createAutoSaveService();

// ─── Global auto-save integration ───────────────────────────

// Register global instance so stores can call requestSave()
setGlobalAutoSave(autoSaveService);

// Wire auto-save → Google Sheets: when save triggers, push data if connected
autoSaveService.onSave(async () => {
  const linkedId = await googleSheetsService.getLinkedSpreadsheetId();
  const isConnected = await googleSheetsService.isConnected();
  if (linkedId && isConnected) {
    try {
      await googleSheetsService.exportMembersToSheet(linkedId);
      await googleSheetsService.exportAttendanceToSheet(linkedId);
      logger.info('Container', 'Auto-save: Google Sheets sync completed');
    } catch (error) {
      logger.error('Container', 'Auto-save: Google Sheets sync failed',
        error instanceof Error ? error : undefined);
    }
  }
});

// ─── Sync Engine (local-only, no remote sync) ───────────────

const syncEngine: Dependencies['syncEngine'] = {
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
    visitationService,
    googleSheetsService,
    autoSaveService,
    syncEngine,
    isDev: __DEV__,
    appVersion: '1.0.0',
  };
}