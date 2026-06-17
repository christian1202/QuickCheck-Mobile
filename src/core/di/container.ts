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
//   - Fully typed — zero `unknown` in interfaces
//
// Usage:
//   <DIProvider value={container}><App /></DIProvider>
//   const { memberService } = useDI();
// ============================================================

import React, { createContext, useContext } from 'react';
import type { Logger } from '../logging/logger';
import type {
  Member, MemberFilters,
  Event, EventFilters,
  AttendanceRecord,
  DashboardData,
} from '../types/domain';

// ─── Service Interfaces ─────────────────────────────────────

export interface IAuthService {
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<{ id: string; email: string; role: string } | null>;
  isAuthenticated(): Promise<boolean>;
  createAccount(email: string, password: string, fullName: string, role: string): Promise<void>;
  isFirstRun(): Promise<boolean>;
}

export interface IMemberService {
  getMembers(filters?: MemberFilters): Promise<Member[]>;
  getMemberById(id: string): Promise<Member | null>;
  createMember(data: Member): Promise<Member>;
  updateMember(id: string, data: Partial<Member>): Promise<Member>;
  deleteMember(id: string): Promise<void>;
  searchMembers(query: string): Promise<Member[]>;
}

export interface IEventService {
  getEvents(filters?: EventFilters): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  createEvent(data: Event): Promise<Event>;
  updateEvent(id: string, data: Partial<Event>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
}

export interface IAttendanceService {
  markAttendance(
    eventId: string,
    marks: Array<{ memberId: string; status: string; minutesLate?: number }>,
  ): Promise<AttendanceRecord[]>;
  getAttendanceForEvent(eventId: string): Promise<AttendanceRecord[]>;
  getAttendanceForMember(memberId: string): Promise<AttendanceRecord[]>;
}

export interface IReportService {
  getDashboardData(): Promise<DashboardData>;
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

export interface IGoogleSheetsService {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  exportMembersToSheet(spreadsheetId: string): Promise<void>;
  exportAttendanceToSheet(spreadsheetId: string, eventId?: string): Promise<void>;
  exportEventsToSheet(spreadsheetId: string): Promise<void>;
  exportAllToSheet(spreadsheetId: string): Promise<void>;
  createSpreadsheet(title: string): Promise<string>;
  linkSpreadsheet(spreadsheetId: string): Promise<void>;
  getLinkedSpreadsheetId(): Promise<string | null>;
  getLinkedSpreadsheetName(): Promise<string | null>;
}

export interface IAutoSaveService {
  enable(): void;
  disable(): void;
  isEnabled(): boolean;
  getLastSaveTime(): Date | null;
  triggerSave(): Promise<void>;
  scheduleSave(): void;
  onSave(callback: () => Promise<void>): () => void;
  setDebounceMs(ms: number): void;
  setMaxWaitMs(ms: number): void;
}

// ─── Container Interface ───────────────────────────────────

export interface Dependencies {
  logger: Logger;

  // Feature services
  authService: IAuthService;
  memberService: IMemberService;
  eventService: IEventService;
  attendanceService: IAttendanceService;
  reportService: IReportService;

  // Google Sheets & Auto-Save (nullable — only available when wired)
  googleSheetsService: IGoogleSheetsService | null;
  autoSaveService: IAutoSaveService | null;

  // Infrastructure
  syncEngine: ISyncEngine;

  // Config
  isDev: boolean;
  appVersion: string;
}

// ─── React Context ─────────────────────────────────────────

const DIContext = createContext<Dependencies | null>(null);

export const DIProvider = DIContext.Provider;

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

export function useOptionalDI(): Dependencies | null {
  return useContext(DIContext);
}

export function useService<K extends keyof Dependencies>(key: K): Dependencies[K] {
  const container = useDI();
  return container[key];
}

// ─── Testing Helpers ───────────────────────────────────────

export function createMockContainer(overrides: Partial<Dependencies> = {}): Dependencies {
  const noop = () => {};
  const noopAsync = async () => {};

  return {
    logger: {
      debug: noop, info: noop, warn: noop, error: noop,
      addTransport: noop, removeTransport: noop, setMinLevel: noop,
      getEntries: () => [], getErrors: () => [],
    } as unknown as Logger,

    authService: {
      login: noopAsync, logout: noopAsync,
      getCurrentUser: async () => null,
      isAuthenticated: async () => false,
      createAccount: noopAsync,
      isFirstRun: async () => true,
    },

    memberService: {
      getMembers: async () => [],
      getMemberById: async () => null,
      createMember: async () => ({}) as Member,
      updateMember: async () => ({}) as Member,
      deleteMember: noopAsync,
      searchMembers: async () => [],
    },

    eventService: {
      getEvents: async () => [],
      getEventById: async () => null,
      createEvent: async () => ({}) as Event,
      updateEvent: async () => ({}) as Event,
      deleteEvent: noopAsync,
    },

    attendanceService: {
      markAttendance: async () => [],
      getAttendanceForEvent: async () => [],
      getAttendanceForMember: async () => [],
    },

    reportService: {
      getDashboardData: async () => ({}) as DashboardData,
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

    googleSheetsService: null,
    autoSaveService: null,

    isDev: false,
    appVersion: '0.0.0-test',

    ...overrides,
  };
}