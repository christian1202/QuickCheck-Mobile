// ============================================================
// QuickCheck — Network Monitor
// ============================================================
// Tracks online/offline status and notifies listeners.
// Used by sync engine to trigger sync on reconnect.
// Used by UI to show offline indicator.
//
// Usage:
//   import { networkMonitor } from '@core/monitoring/networkMonitor';
//
//   // Subscribe to changes
//   networkMonitor.subscribe((isOnline) => { ... });
//
//   // Check current status
//   const online = networkMonitor.isOnline();
// ============================================================

import { logger } from '../logging/logger';

type NetworkListener = (isOnline: boolean) => void;

class NetworkMonitor {
  private online: boolean = true;
  private wasOffline: boolean = false;
  private listeners: Set<NetworkListener> = new Set();
  private unsubscribeNetInfo: (() => void) | null = null;

  /**
   * Initialize the network monitor with NetInfo.
   * Call this once at app startup.
   *
   * @param netInfo - The NetInfo module from @react-native-community/netinfo
   */
  initialize(netInfo: {
    addEventListener: (listener: (state: { isConnected: boolean }) => void) => () => void;
    fetch: () => Promise<{ isConnected: boolean }>;
  }): void {
    // Fetch initial state
    netInfo.fetch().then(state => {
      this.updateStatus(state.isConnected);
      logger.info('NetworkMonitor', 'Initial network status', { isOnline: state.isConnected });
    }).catch(err => {
      logger.warn('NetworkMonitor', 'Failed to fetch initial network status', { error: err });
    });

    // Listen for changes
    this.unsubscribeNetInfo = netInfo.addEventListener(state => {
      this.updateStatus(state.isConnected);
    });

    logger.info('NetworkMonitor', 'NetworkMonitor initialized');
  }

  /**
   * Clean up listeners. Call on app teardown.
   */
  destroy(): void {
    this.unsubscribeNetInfo?.();
    this.listeners.clear();
    logger.info('NetworkMonitor', 'NetworkMonitor destroyed');
  }

  /**
   * Current online status.
   */
  isOnline(): boolean {
    return this.online;
  }

  /**
   * Subscribe to online/offline changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Returns true if the device went from offline to online (just reconnected).
   * Resets after being read.
   */
  justReconnected(): boolean {
    const result = this.wasOffline && this.online;
    this.wasOffline = false;
    return result;
  }

  /**
   * Update the online status and notify listeners.
   */
  private updateStatus(isConnected: boolean): void {
    const previous = this.online;
    this.online = isConnected;

    if (previous && !isConnected) {
      this.wasOffline = true;
      logger.info('NetworkMonitor', 'Device went offline');
    }

    if (!previous && isConnected) {
      logger.info('NetworkMonitor', 'Device came back online');
    }

    if (previous !== isConnected) {
      this.notifyListeners();
    }
  }

  /**
   * Notify all subscribers of the current status.
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.online);
      } catch (error) {
        logger.error('NetworkMonitor', 'Listener threw error', error instanceof Error ? error : undefined);
      }
    });
  }
}

// ─── Singleton Instance ────────────────────────────────────

export const networkMonitor = new NetworkMonitor();