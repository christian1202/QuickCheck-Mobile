// ============================================================
// QuickCheck — Structured Logging Service
// ============================================================
// Provides leveled logging with multiple transports.
// Usage:
//   import { logger } from '@core/logging';
//   logger.info('Dashboard', 'Dashboard loaded', { memberCount: 1284 });
//   logger.error('Sync', 'Sync failed', error, { lastSync: '...' });
// ============================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
  error?: Error;
}

export interface Transport {
  send(entry: LogEntry): void;
}

/**
 * Console Transport — logs to the JavaScript console.
 * Enabled in all environments. Uses appropriate console method per level.
 */
export class ConsoleTransport implements Transport {
  send(entry: LogEntry): void {
    const prefix = `[${new Date(entry.timestamp).toISOString()}] [${LogLevel[entry.level]}] [${entry.module}]`;
    const data = { ...entry.data, ...(entry.error ? { stack: entry.error.stack, message: entry.error.message } : {}) };

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(prefix, entry.message, data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, data);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, data);
        break;
      case LogLevel.DEBUG:
      default:
        console.debug(prefix, entry.message, data);
        break;
    }
  }
}

/**
 * Memory Transport — stores logs in memory for debugging.
 * Useful for viewing logs in a dev overlay or sending on crash.
 */
export class MemoryTransport implements Transport {
  private buffer: LogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries: number = 500) {
    this.maxEntries = maxEntries;
  }

  send(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length > this.maxEntries) {
      this.buffer = this.buffer.slice(-this.maxEntries);
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level === undefined) return [...this.buffer];
    return this.buffer.filter(e => e.level >= level);
  }

  getErrors(): LogEntry[] {
    return this.buffer.filter(e => e.level === LogLevel.ERROR);
  }

  clear(): void {
    this.buffer = [];
  }
}

/**
 * Logger — main logging service.
 * Supports multiple transports simultaneously (console, memory, remote, etc.).
 */
export class Logger {
  private transports: Transport[] = [];
  private minLevel: LogLevel;

  constructor(transports: Transport[] = [], minLevel: LogLevel = LogLevel.DEBUG) {
    this.transports = transports;
    this.minLevel = minLevel;
  }

  addTransport(transport: Transport): void {
    this.transports.push(transport);
  }

  removeTransport(transport: Transport): void {
    this.transports = this.transports.filter(t => t !== transport);
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  debug(module: string, message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, module, message, data);
  }

  info(module: string, message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, module, message, data);
  }

  warn(module: string, message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, module, message, data);
  }

  error(module: string, message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, module, message, data, error);
  }

  private log(
    level: LogLevel,
    module: string,
    message: string,
    data?: Record<string, unknown>,
    error?: Error,
  ): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      module,
      message,
      data,
      error,
    };

    for (const transport of this.transports) {
      try {
        transport.send(entry);
      } catch (e) {
        // Never let logging itself throw
        console.error('Logger transport failed:', e);
      }
    }
  }
}

// ─── Singleton Instance ────────────────────────────────────

const memoryTransport = new MemoryTransport(1000);
const consoleTransport = new ConsoleTransport();

export const logger = new Logger(
  [consoleTransport, memoryTransport],
  __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
);

// Expose memory transport for debug overlays
export { memoryTransport };