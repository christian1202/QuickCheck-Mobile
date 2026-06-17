// ============================================================
// QuickCheck — Auto-Save Service
// ============================================================
// Debounced auto-save engine that watches WatermelonDB for
// changes and persists data automatically. Optionally pushes
// to Google Sheets if configured.
//
// Features:
//   - Debounced saves (configurable interval, default 3s)
//   - Max wait time ensures saves happen even with rapid changes
//   - Google Sheets auto-export integration
//   - Manual trigger save
//   - scheduleSave() for debounced requests (collapses multiple calls)
//   - Last save timestamp tracking
//   - Enables/disables dynamically
//
// Usage:
//   const autoSave = createAutoSaveService();
//   autoSave.enable();
//   autoSave.onSave(async () => { ... });
// ============================================================

import { logger } from '../logging/logger';

// ─── Types ───────────────────────────────────────────────────

export interface AutoSaveServiceInterface {
  /** Enable auto-save. If already enabled, this is a no-op. */
  enable(): void;
  /** Disable auto-save. Pending saves will be cancelled. */
  disable(): void;
  /** Returns whether auto-save is currently enabled. */
  isEnabled(): boolean;
  /** Returns the timestamp of the last successful save, or null if never saved. */
  getLastSaveTime(): Date | null;
  /** Manually trigger a save immediately (bypasses debounce). */
  triggerSave(): Promise<void>;
  /** Schedule a debounced save. Multiple calls within debounce window collapse into one save. */
  scheduleSave(): void;
  /** Register a callback to be called when a save is triggered. Returns an unsubscribe function. */
  onSave(callback: () => Promise<void>): () => void;
  /** Configure the debounce interval in milliseconds (default: 3000). */
  setDebounceMs(ms: number): void;
  /** Configure the maximum wait time before a save is forced (default: 15000). */
  setMaxWaitMs(ms: number): void;
}

// ─── Configuration ───────────────────────────────────────────

const DEFAULT_DEBOUNCE_MS = 3000; // 3 seconds
const DEFAULT_MAX_WAIT_MS = 15000; // 15 seconds

// ─── Service Implementation ─────────────────────────────────

export function createAutoSaveService(): AutoSaveServiceInterface {
  let isEnabledFlag = false;
  let lastSaveTime: Date | null = null;
  let debounceMs = DEFAULT_DEBOUNCE_MS;
  let maxWaitMs = DEFAULT_MAX_WAIT_MS;

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let maxWaitTimer: ReturnType<typeof setTimeout> | null = null;
  let isSaving = false;
  let pendingSave = false;

  const saveCallbacks: Array<() => Promise<void>> = [];

  // ── Private: Perform Save ──────────────────────────────

  async function performSave(): Promise<void> {
    if (isSaving) {
      pendingSave = true;
      logger.debug('AutoSave', 'Save already in progress, marked pending');
      return;
    }

    isSaving = true;
    pendingSave = false;

    // Clear timers
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    if (maxWaitTimer) { clearTimeout(maxWaitTimer); maxWaitTimer = null; }

    const startTime = Date.now();
    logger.info('AutoSave', 'Starting save');

    try {
      await Promise.all(saveCallbacks.map((cb) => cb()));

      lastSaveTime = new Date();
      const duration = Date.now() - startTime;
      logger.info('AutoSave', 'Save completed', { durationMs: duration });

    } catch (error) {
      logger.error('AutoSave', 'Save failed', error instanceof Error ? error : undefined);
    } finally {
      isSaving = false;

      // If another save was requested while this one was running, schedule it
      if (pendingSave) {
        logger.debug('AutoSave', 'Re-triggering save due to pending request');
        scheduleDebouncedSave();
      }
    }
  }

  function scheduleDebouncedSave(): void {
    if (!isEnabledFlag) {
      logger.debug('AutoSave', 'Auto-save is disabled, skipping schedule');
      return;
    }

    // Reset debounce timer on each call
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      if (maxWaitTimer) { clearTimeout(maxWaitTimer); maxWaitTimer = null; }
      performSave();
    }, debounceMs);

    // Max wait timer — ensures save happens even with rapid changes
    if (!maxWaitTimer) {
      maxWaitTimer = setTimeout(() => {
        maxWaitTimer = null;
        if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
        logger.info('AutoSave', 'Max wait time reached, forcing save');
        performSave();
      }, maxWaitMs);
    }

    logger.debug('AutoSave', 'Save scheduled', { debounceMs, maxWaitMs });
  }

  // ── Public API ─────────────────────────────────────────

  return {
    enable(): void {
      if (isEnabledFlag) {
        logger.debug('AutoSave', 'Already enabled');
        return;
      }
      isEnabledFlag = true;
      logger.info('AutoSave', 'Auto-save enabled', { debounceMs, maxWaitMs });
    },

    disable(): void {
      if (!isEnabledFlag) {
        logger.debug('AutoSave', 'Already disabled');
        return;
      }
      isEnabledFlag = false;
      if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
      if (maxWaitTimer) { clearTimeout(maxWaitTimer); maxWaitTimer = null; }
      logger.info('AutoSave', 'Auto-save disabled');
    },

    isEnabled(): boolean {
      return isEnabledFlag;
    },

    getLastSaveTime(): Date | null {
      return lastSaveTime;
    },

    async triggerSave(): Promise<void> {
      if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
      if (maxWaitTimer) { clearTimeout(maxWaitTimer); maxWaitTimer = null; }
      logger.info('AutoSave', 'Manual save triggered');
      await performSave();
    },

    scheduleSave(): void {
      scheduleDebouncedSave();
    },

    onSave(callback: () => Promise<void>): () => void {
      saveCallbacks.push(callback);
      logger.debug('AutoSave', 'Save callback registered', { totalCallbacks: saveCallbacks.length });
      return () => {
        const index = saveCallbacks.indexOf(callback);
        if (index !== -1) {
          saveCallbacks.splice(index, 1);
          logger.debug('AutoSave', 'Save callback unregistered', { totalCallbacks: saveCallbacks.length });
        }
      };
    },

    setDebounceMs(ms: number): void {
      if (ms < 500) {
        logger.warn('AutoSave', 'Debounce ms too low, clamping to 500ms');
        ms = 500;
      }
      debounceMs = ms;
      logger.info('AutoSave', 'Debounce interval updated', { debounceMs: ms });
    },

    setMaxWaitMs(ms: number): void {
      if (ms < debounceMs) {
        logger.warn('AutoSave', 'Max wait ms must be >= debounce ms, adjusting');
        ms = debounceMs * 2;
      }
      maxWaitMs = ms;
      logger.info('AutoSave', 'Max wait interval updated', { maxWaitMs: ms });
    },
  };
}

// ─── Global Save Request Helper ─────────────────────────────

let globalAutoSaveInstance: AutoSaveServiceInterface | null = null;

/**
 * Set the global auto-save instance so stores can call requestSave().
 * Called once at app startup in container.ts.
 */
export function setGlobalAutoSave(instance: AutoSaveServiceInterface): void {
  globalAutoSaveInstance = instance;
}

/**
 * Request a debounced save. Safe to call after every mutation.
 * If auto-save is disabled, this is a no-op.
 *
 * Usage in stores:
 *   import { requestSave } from '@core/services/autoSaveService';
 *   requestSave();
 */
export function requestSave(): void {
  if (globalAutoSaveInstance && globalAutoSaveInstance.isEnabled()) {
    globalAutoSaveInstance.scheduleSave();
  }
}