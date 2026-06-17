// ============================================================
// QuickCheck — useExport Hook
// ============================================================
// Wires the export store to the DI container.
// Provides a clean API for screens to interact with
// Google Sheets export and auto-save.
//
// Usage:
//   const {
//     isGoogleConnected, connectGoogle, exportMembers, ...
//   } = useExport();
// ============================================================

import { useCallback, useEffect } from 'react';
import { useDI } from '../../../core/di/container';
import { useExportStore } from '../store/exportStore';

export function useExport() {
  const { googleSheetsService, autoSaveService, logger } = useDI();
  const store = useExportStore();

  // ── Initialize ──────────────────────────────────────────

  useEffect(() => {
    // Check Google connection and load linked spreadsheet on mount
    if (googleSheetsService) {
      store.checkConnection(googleSheetsService);
      store.loadLinkedSpreadsheet(googleSheetsService);
    }
  }, []);

  // ── Google Connection ───────────────────────────────────

  const connectGoogle = useCallback(async (): Promise<boolean> => {
    if (!googleSheetsService) {
      logger.warn('useExport', 'GoogleSheetsService not available');
      return false;
    }
    logger.info('useExport', 'Connecting to Google');
    return store.connectGoogle(googleSheetsService);
  }, [googleSheetsService]);

  const disconnectGoogle = useCallback(async (): Promise<void> => {
    if (!googleSheetsService) return;
    logger.info('useExport', 'Disconnecting from Google');
    return store.disconnectGoogle(googleSheetsService);
  }, [googleSheetsService]);

  // ── Spreadsheet ─────────────────────────────────────────

  const linkSpreadsheet = useCallback(async (spreadsheetId: string): Promise<void> => {
    if (!googleSheetsService) {
      throw new Error('GoogleSheetsService not available');
    }
    return store.linkSpreadsheet(googleSheetsService, spreadsheetId);
  }, [googleSheetsService]);

  const createAndLinkSpreadsheet = useCallback(async (title: string): Promise<void> => {
    if (!googleSheetsService) {
      throw new Error('GoogleSheetsService not available');
    }
    return store.createAndLinkSpreadsheet(googleSheetsService, title);
  }, [googleSheetsService]);

  // ── Export ──────────────────────────────────────────────

  const exportMembers = useCallback(async (): Promise<void> => {
    if (!googleSheetsService) throw new Error('GoogleSheetsService not available');
    const spreadsheetId = store.linkedSpreadsheetId;
    if (!spreadsheetId) throw new Error('No spreadsheet linked. Please link a spreadsheet first.');
    return store.exportMembers(googleSheetsService, spreadsheetId);
  }, [googleSheetsService, store.linkedSpreadsheetId]);

  const exportAttendance = useCallback(async (eventId?: string): Promise<void> => {
    if (!googleSheetsService) throw new Error('GoogleSheetsService not available');
    const spreadsheetId = store.linkedSpreadsheetId;
    if (!spreadsheetId) throw new Error('No spreadsheet linked. Please link a spreadsheet first.');
    return store.exportAttendance(googleSheetsService, spreadsheetId, eventId);
  }, [googleSheetsService, store.linkedSpreadsheetId]);

  const exportEvents = useCallback(async (): Promise<void> => {
    if (!googleSheetsService) throw new Error('GoogleSheetsService not available');
    const spreadsheetId = store.linkedSpreadsheetId;
    if (!spreadsheetId) throw new Error('No spreadsheet linked. Please link a spreadsheet first.');
    return store.exportEvents(googleSheetsService, spreadsheetId);
  }, [googleSheetsService, store.linkedSpreadsheetId]);

  const exportAll = useCallback(async (): Promise<void> => {
    if (!googleSheetsService) throw new Error('GoogleSheetsService not available');
    const spreadsheetId = store.linkedSpreadsheetId;
    if (!spreadsheetId) throw new Error('No spreadsheet linked. Please link a spreadsheet first.');
    return store.exportAll(googleSheetsService, spreadsheetId);
  }, [googleSheetsService, store.linkedSpreadsheetId]);

  // ── Auto-Save ───────────────────────────────────────────

  const toggleAutoSave = useCallback((): void => {
    if (!autoSaveService) {
      logger.warn('useExport', 'AutoSaveService not available');
      return;
    }
    store.toggleAutoSave(autoSaveService);
  }, [autoSaveService]);

  const toggleAutoSaveGoogleSheets = useCallback((): void => {
    store.toggleAutoSaveGoogleSheets();
  }, []);

  return {
    // Connection
    isGoogleConnected: store.isGoogleConnected,
    isConnecting: store.isConnecting,
    connectGoogle,
    disconnectGoogle,

    // Spreadsheet
    linkedSpreadsheetId: store.linkedSpreadsheetId,
    linkedSpreadsheetName: store.linkedSpreadsheetName,
    linkSpreadsheet,
    createAndLinkSpreadsheet,

    // Export
    isExporting: store.isExporting,
    lastExportTime: store.lastExportTime,
    exportError: store.exportError,
    exportProgress: store.exportProgress,
    exportMembers,
    exportAttendance,
    exportEvents,
    exportAll,

    // Auto-Save
    autoSaveEnabled: store.autoSaveEnabled,
    autoSaveGoogleSheets: store.autoSaveGoogleSheets,
    toggleAutoSave,
    toggleAutoSaveGoogleSheets,
  };
}