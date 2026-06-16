// ============================================================
// QuickCheck — Dependency Injection Container
// ============================================================
// Provides a simple service locator pattern using React Context.
// Services are registered at app startup and accessed via hooks.
//
// Benefits:
//   - Decouples modules (services don't import each other)
//   - Easy to swap implementations (e.g., mock for testing)
//   - Central place to see all app dependencies
//
// Usage:
//   // At app startup:
//   <DIProvider value={container}>
//     <App />
//   </DIProvider>
//
//   // In any component/hook:
//   const { memberService } = useDI();
// ============================================================

import React, { createContext, useContext } from 'react';
import type { Logger } from '../logging/logger';

// ─── Service Interfaces (forward declarations to avoid circular deps) ───

export interface IAuthService {
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<{ id: string; email: string; role: string } | null>;
  isAuthenticated(): Promise<boolean>;
  createAccount(email: string, password: string, fullName: string, role: string): Promise<void>;
  isFirstRun(): Promise<boolean>;
}

export interface IMemberService {
  getMembers(filters?: unknown): Promise<unknown[]>;
  getMemberById(id: string): Promise<unknown | null>;
  createMember(data: unknown): Promise<unknown>;
  updateMember(id: string, data: unknown): Promise<unknown>;
  deleteMember(id: string): Promise<void>;
  searchMembers(query: string): Promise<unknown[]>;
}

export interface IEventService {
  getEvents(filters?: unknown): Promise<unknown[]>;
  getEventById(id: string): Promise<unknown | null>;
  createEvent(data: unknown): Promise<unknown>;
  updateEvent(id: string, data: unknown): Promise<unknown>;
  deleteEvent(id: string): Promise<void>;
}

export interface IAttendanceService {
  markAttendance(eventId: string, marks: unknown[]): Promise<unknown[]>;
  getAttendanceForEvent(eventId: string): Promise<unknown[]>;
  getAttendanceForMember(memberId: string): Promise<unknown[]>;
}

export interface IReportService {
  getDashboardData(): Promise<unknown>;
  getMemberReport(memberId: string): Promise<unknown>;
  getAbsenceReports(filters?: unknown): Promise<unknown[]>;
  exportReport(type: string, filters?: unknown): Promise<string>;
}

export interface ISyncEngine {
  sync(): Promise<void>;
  requestSync(): void;
  getLastSyncTime(): Date | null;
  isOnline(): boolean;
}

// ─── Container Interface ───────────────────────────────────

export interface Dependencies {
  logger: Logger;

  // Services (initialized lazily or at startup)
  authService: IAuthService;
  memberService: IMemberService;
  eventService: IEventService;
  attendanceService: IAttendanceService;
  reportService: IReportService;

  // Infrastructure
  syncEngine: ISyncEngine;

  // Config
  isDev: boolean;
  appVersion: string;
}

// ─── React Context ─────────────────────────────────────────

const DIContext = createContext<Dependencies | null>(null);

export const DIProvider = DIContext.Provider;

/**
 * Hook to access the DI container.
 * Throws if used outside DIProvider (in tests, wrap with a test provider).
 */
export function useDI(): Dependencies {
  const container = useContext(DIContext);
  if (!container) {
    throw new Error(
      'useDI() was called outside of <DIProvider>. ' +
      'Make sure DIProvider wraps your app component tree.',
    );
  }
  return container;
}

/**
 * Optional hook — returns null if outside provider instead of throwing.
 * Useful for components that may render outside the provider during tests.
 */
export function useOptionalDI(): Dependencies | null {
  return useContext(DIContext);
}

// ─── Service Accessor Helpers ──────────────────────────────

/**
 * Quick access to a specific service from the container.
 * Example: const memberService = useService('memberService');
 */
export function useService<K extends keyof Dependencies>(key: K): Dependencies[K] {
  const container = useDI();
  return container[key];
}

// ─── Testing Helpers ───────────────────────────────────────

/**
 * Creates a mock container for unit testing.
 * Only override what you need — the rest are no-op stubs.
 */
export function createMockContainer(overrides: Partial<Dependencies> = {}): Dependencies {
  const noop = () => {};
  const noopAsync = async () => {};

  return {
    logger: {
      debug: noop,
      info: noop,
      warn: noop,
      error: noop,
      addTransport: noop,
      removeTransport: noop,
      setMinLevel: noop,
    } as unknown as Logger,

    authService: {
      login: noopAsync,
      logout: noopAsync,
      getCurrentUser: async () => null,
      isAuthenticated: async () => false,
      createAccount: noopAsync,
      isFirstRun: async () => true,
    },

    memberService: {
      getMembers: async () => [],
      getMemberById: async () => null,
      createMember: async () => ({}),
      updateMember: async () => ({}),
      deleteMember: noopAsync,
      searchMembers: async () => [],
    },

    eventService: {
      getEvents: async () => [],
      getEventById: async () => null,
      createEvent: async () => ({}),
      updateEvent: async () => ({}),
      deleteEvent: noopAsync,
    },

    attendanceService: {
      markAttendance: async () => [],
      getAttendanceForEvent: async () => [],
      getAttendanceForMember: async () => [],
    },

    reportService: {
      getDashboardData: async () => ({}),
      getMemberReport: async () => ({}),
      getAbsenceReports: async () => [],
      exportReport: async () => '',
    },

    syncEngine: {
      sync: noopAsync,
      requestSync: noop,
      getLastSyncTime: () => null,
      isOnline: () => true,
    },

    isDev: false,
    appVersion: '0.0.0-test',

    ...overrides,
  };
}