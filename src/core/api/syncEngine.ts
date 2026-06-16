// ============================================================
// QuickCheck — Sync Engine
// ============================================================
// Coordinates data synchronization between WatermelonDB (local)
// and Supabase (remote). Uses the network monitor to detect
// connectivity and triggers sync automatically.
//
// Features:
//   - Delta sync (only changed records since last sync)
//   - Automatic sync on reconnect
//   - Periodic background sync
//   - Debounced manual sync requests
//   - Conflict resolution (server wins)
//   - Retry with exponential backoff on failure
//
// Usage:
//   import { syncEngine } from '@core/api/syncEngine';
//
//   // Initialize at app startup
//   await syncEngine.initialize();
//
//   // Request a sync (debounced — won't flood the server)
//   syncEngine.requestSync();
//
//   // Force immediate sync
//   await syncEngine.syncNow();
// ============================================================

import { logger } from '../logging/logger';
import { networkMonitor } from '../monitoring/networkMonitor';

// ─── Types ──────────────────────────────────────────────────

interface SyncState {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  pendingSync: boolean;
  consecutiveFailures: number;
  retryTimeout: ReturnType<typeof setTimeout> | null;
  periodicInterval: ReturnType<typeof setInterval> | null;
}

interface SyncPullResponse {
  changes: Record<string, { created: unknown[]; updated: unknown[]; deleted: string[] }>;
  timestamp: number;
}

interface SyncPushRequest {
  changes: Record<string, { created: unknown[]; updated: unknown[]; deleted: string[] }>;
  lastPulledAt: number;
}

// ─── Configuration ──────────────────────────────────────────

const SYNC_CONFIG = {
  /** Debounce time in ms — sync requests within this window are merged */
  debounceMs: 2000,

  /** Periodic sync interval in ms */
  periodicSyncMs: 5 * 60 * 1000,

  /** Maximum number of retry attempts */
  maxRetries: 5,

  /** Base delay for exponential backoff (ms) */
  retryBaseDelayMs: 1000,

  /** Maximum delay for exponential backoff (ms) */
  retryMaxDelayMs: 60 * 1000,
};

// ─── Sync Engine ────────────────────────────────────────────

class SyncEngine {
  private state: SyncState = {
    lastSyncTime: null,
    isSyncing: false,
    pendingSync: false,
    consecutiveFailures: 0,
    retryTimeout: null,
    periodicInterval: null,
  };

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isInitialized: boolean = false;

  // Dependencies injected later
  private syncFn: (() => Promise<void>) | null = null;
  private onlineCheck: (() => boolean) | null = null;

  /**
   * Initialize the sync engine.
   * @param syncFn - The function that performs the actual sync (calls WatermelonDB synchronize)
   * @param onlineCheck - Function to check online status (defaults to networkMonitor)
   */
  initialize(syncFn: () => Promise<void>, onlineCheck?: () => boolean): void {
    if (this.isInitialized) {
      logger.warn('SyncEngine', 'Already initialized, skipping');
      return;
    }

    this.syncFn = syncFn;
    this.onlineCheck = onlineCheck ?? (() => networkMonitor.isOnline());

    // Start periodic sync
    this.state.periodicInterval = setInterval(() => {
      this.requestSync();
    }, SYNC_CONFIG.periodicSyncMs);

    // Sync when coming back online
    networkMonitor.subscribe((isOnline) => {
      if (isOnline && networkMonitor.justReconnected()) {
        logger.info('SyncEngine', 'Network reconnected, triggering sync');
        this.requestSync();
      }
    });

    this.isInitialized = true;
    logger.info('SyncEngine', 'Sync engine initialized', {
      periodicSyncMs: SYNC_CONFIG.periodicSyncMs,
      debounceMs: SYNC_CONFIG.debounceMs,
    });
  }

  /**
   * Clean up timers and listeners.
   */
  destroy(): void {
    if (this.state.periodicInterval) {
      clearInterval(this.state.periodicInterval);
    }
    if (this.state.retryTimeout) {
      clearTimeout(this.state.retryTimeout);
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.isInitialized = false;
    logger.info('SyncEngine', 'Sync engine destroyed');
  }

  /**
   * Request a sync. Debounced — multiple calls within debounceMs
   * will result in a single sync execution.
   *
   * Safe to call after every write operation.
   */
  requestSync(): void {
    if (!this.isInitialized) {
      logger.warn('SyncEngine', 'requestSync called before initialization');
      return;
    }

    if (this.debounceTimer) {
      // Already scheduled, mark as pending
      this.state.pendingSync = true;
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.performSync();
    }, SYNC_CONFIG.debounceMs);
  }

  /**
   * Force an immediate sync, bypassing debounce.
   * Use for critical operations (e.g., after marking attendance before closing app).
   */
  async syncNow(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    return this.performSync();
  }

  /**
   * Get the timestamp of the last successful sync.
   */
  getLastSyncTime(): Date | null {
    return this.state.lastSyncTime;
  }

  /**
   * Check if a sync is currently in progress.
   */
  isSyncing(): boolean {
    return this.state.isSyncing;
  }

  /**
   * Check if online.
   */
  isOnline(): boolean {
    return this.onlineCheck?.() ?? true;
  }

  // ─── Private Methods ──────────────────────────────────────

  private async performSync(): Promise<void> {
    if (!this.isInitialized || !this.syncFn) {
      logger.warn('SyncEngine', 'Cannot sync: not initialized');
      return;
    }

    // Skip if offline
    if (!this.isOnline()) {
      logger.debug('SyncEngine', 'Skipping sync: device is offline');
      this.state.pendingSync = true;
      return;
    }

    // Skip if already syncing
    if (this.state.isSyncing) {
      this.state.pendingSync = true;
      logger.debug('SyncEngine', 'Sync already in progress, marked pending');
      return;
    }

    this.state.isSyncing = true;
    this.state.pendingSync = false;

    const startTime = Date.now();

    try {
      logger.info('SyncEngine', 'Starting sync');

      await this.syncFn();

      // Success — reset failure counter
      this.state.lastSyncTime = new Date();
      this.state.consecutiveFailures = 0;

      const duration = Date.now() - startTime;
      logger.info('SyncEngine', 'Sync completed successfully', { durationMs: duration });

    } catch (error) {
      this.state.consecutiveFailures++;
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('SyncEngine', 'Sync failed', err, {
        attempt: this.state.consecutiveFailures,
        maxRetries: SYNC_CONFIG.maxRetries,
      });

      // Schedule retry with exponential backoff
      if (this.state.consecutiveFailures <= SYNC_CONFIG.maxRetries) {
        const delay = Math.min(
          SYNC_CONFIG.retryBaseDelayMs * Math.pow(2, this.state.consecutiveFailures - 1),
          SYNC_CONFIG.retryMaxDelayMs,
        );

        logger.info('SyncEngine', 'Scheduling retry', { delayMs: delay });

        this.state.retryTimeout = setTimeout(() => {
          this.requestSync();
        }, delay);
      } else {
        logger.error('SyncEngine', 'Max retries exceeded — sync will resume on next periodic sync or reconnect');
      }

    } finally {
      this.state.isSyncing = false;

      // If another sync was requested while this was running, start it
      if (this.state.pendingSync) {
        this.requestSync();
      }
    }
  }
}

// ─── Singleton Instance ────────────────────────────────────

export const syncEngine = new SyncEngine();