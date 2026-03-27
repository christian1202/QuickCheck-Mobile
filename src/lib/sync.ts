// ============================================================
// QuickCheck — WatermelonDB Sync Adapter
// ============================================================
// Implements WatermelonDB's synchronize() protocol using the
// /sync Edge Function for delta sync.
//
// Usage in your app:
//   import { syncDatabase } from './sync';
//   await syncDatabase();
// ============================================================

import { synchronize } from "@nozbe/watermelondb/sync";
import { database } from "../db";
import { supabase } from "./supabase";

const SYNC_FUNCTION_NAME = "sync";

/**
 * Perform a delta sync between WatermelonDB and Supabase.
 *
 * Call this:
 * - On app startup (after auth)
 * - When network status changes from offline → online
 * - Periodically in the background (every 5 minutes)
 * - After any local write operation (debounced)
 */
export async function syncDatabase(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.log("Sync skipped: not authenticated");
    return;
  }

  try {
    await synchronize({
      database,

      pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
        const timestamp = lastPulledAt ? Math.floor(lastPulledAt / 1000) : 0;

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/${SYNC_FUNCTION_NAME}?last_pulled_at=${timestamp}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Pull failed: ${response.statusText}`);
        }

        const result = await response.json();

        return {
          changes: mapPullChanges(result.changes),
          timestamp: result.timestamp * 1000, // Convert to milliseconds
        };
      },

      pushChanges: async ({ changes, lastPulledAt }) => {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/${SYNC_FUNCTION_NAME}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              changes: mapPushChanges(changes),
              lastPulledAt: lastPulledAt
                ? Math.floor(lastPulledAt / 1000)
                : 0,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Push failed: ${response.statusText}`);
        }
      },

      // Conflicts: server wins (Supabase is source of truth)
      conflictResolver: undefined,

      // Migration sync (when schema changes on server)
      migrationsEnabledAtVersion: 1,
    });

    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}

// ─── Field Mapping: Supabase → WatermelonDB ──────────────

/**
 * Map Supabase column names to WatermelonDB model fields.
 * WatermelonDB uses camelCase, Supabase uses snake_case.
 */
function mapPullChanges(changes: Record<string, any>) {
  const mapped: Record<string, any> = {};

  for (const [table, tableChanges] of Object.entries(changes)) {
    mapped[table] = {
      created: (tableChanges.created || []).map((r: any) =>
        mapRecordFromServer(r)
      ),
      updated: (tableChanges.updated || []).map((r: any) =>
        mapRecordFromServer(r)
      ),
      deleted: tableChanges.deleted || [],
    };
  }

  return mapped;
}

/**
 * Map WatermelonDB model fields back to Supabase column names.
 */
function mapPushChanges(changes: Record<string, any>) {
  const mapped: Record<string, any> = {};

  for (const [table, tableChanges] of Object.entries(changes)) {
    mapped[table] = {
      created: (tableChanges.created || []).map((r: any) =>
        mapRecordToServer(r)
      ),
      updated: (tableChanges.updated || []).map((r: any) =>
        mapRecordToServer(r)
      ),
      deleted: tableChanges.deleted || [],
    };
  }

  return mapped;
}

/**
 * Convert a server record (snake_case) to WatermelonDB format (camelCase).
 */
function mapRecordFromServer(record: any) {
  const mapped: any = {};

  for (const [key, value] of Object.entries(record)) {
    // Keep id as-is
    if (key === "id") {
      mapped.id = value;
      continue;
    }

    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    mapped[camelKey] = value;
  }

  return mapped;
}

/**
 * Convert a WatermelonDB record (camelCase) to server format (snake_case).
 */
function mapRecordToServer(record: any) {
  const mapped: any = {};

  for (const [key, value] of Object.entries(record)) {
    // Skip WatermelonDB internal fields
    if (key.startsWith("_")) continue;

    // Keep id as-is
    if (key === "id") {
      mapped.id = value;
      continue;
    }

    // Convert camelCase to snake_case
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    mapped[snakeKey] = value;
  }

  return mapped;
}

// ─── Auto-Sync Hook ──────────────────────────────────────

/**
 * Set up auto-sync on network reconnection.
 * Use this with NetInfo from @react-native-community/netinfo.
 *
 * Example usage:
 *   import NetInfo from '@react-native-community/netinfo';
 *   setupAutoSync(NetInfo);
 */
export function setupAutoSync(netInfo: any) {
  let wasOffline = false;

  return netInfo.addEventListener((state: any) => {
    if (state.isConnected && wasOffline) {
      // Just came back online — trigger sync
      syncDatabase().catch(console.error);
    }
    wasOffline = !state.isConnected;
  });
}

/**
 * Set up periodic background sync.
 * Returns a function to cancel the interval.
 */
export function startPeriodicSync(intervalMs = 5 * 60 * 1000): () => void {
  const interval = setInterval(() => {
    syncDatabase().catch(console.error);
  }, intervalMs);

  return () => clearInterval(interval);
}
