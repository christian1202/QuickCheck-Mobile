# QuickCheck Mobile — Architecture Documentation
> Developed by: Christian Jay Basinillo

## Overview

QuickCheck Mobile uses a **Feature-Based Clean Architecture** with unidirectional data flow. This is a **local-first** application — all data lives in WatermelonDB on-device. No cloud dependency.

### Architecture Principles

- **Easy to Fix**: Bugs are in small, co-located files. One feature = one folder. No mystery stubs.
- **Easy to Maintain**: Every feature follows the same pattern: `services/` → `store/` → `hooks/` → `screens/`.
- **Easy to Debug**: Typed service interfaces, structured logger everywhere, error boundary catches all.
- **Scalable**: New features slot into `src/features/yourFeature/` with zero changes to other features.

## Directory Structure

```
src/
├── app/                          # App-level setup
│   ├── AppProviders.tsx          # Provider tree (ErrorBoundary → DI → Theme → Navigation)
│   ├── container.ts              # Production DI container — creates ALL services ONCE
│   └── navigation/               # Navigation setup
│       ├── index.ts              # Barrel export
│       ├── MainTabs.tsx          # Bottom tab navigator
│       ├── RootNavigator.tsx     # Auth-gated root navigator
│       └── types.ts              # Navigation param list types
│
├── core/                         # Core infrastructure (no business logic)
│   ├── types/
│   │   └── domain.ts             # All domain models, enums, error classes
│   ├── logging/
│   │   └── logger.ts             # Structured logging with transports
│   ├── errors/
│   │   └── ErrorBoundary.tsx     # React error boundary
│   ├── di/
│   │   └── container.ts          # DI container, typed service interfaces, hooks
│   ├── monitoring/
│   │   └── networkMonitor.ts     # Online/offline tracking
│   ├── database/                 # WatermelonDB setup
│   │   ├── index.ts              # Database instance, collection accessors
│   │   ├── models.ts             # ORM model classes
│   │   └── schema.ts             # Table schemas
│   └── services/
│       └── autoSaveService.ts    # Debounced auto-save engine with scheduleSave()
│
├── features/                     # Feature modules (one per domain)
│   ├── auth/
│   │   ├── services/authService.ts
│   │   ├── store/authStore.ts
│   │   ├── hooks/useAuth.ts
│   │   ├── screens/
│   │   │   ├── SplashScreen.tsx
│   │   │   └── LoginScreen.tsx
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── services/reportService.ts
│   │   ├── store/dashboardStore.ts
│   │   ├── hooks/useDashboard.ts
│   │   ├── screens/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── ReportsScreen.tsx
│   │   │   └── AbsenceReportScreen.tsx
│   │   └── index.ts
│   ├── members/
│   │   ├── services/memberService.ts
│   │   ├── store/memberStore.ts
│   │   ├── hooks/useMembers.ts
│   │   ├── screens/
│   │   │   ├── MemberListScreen.tsx
│   │   │   ├── AddEditMemberScreen.tsx
│   │   │   └── MemberReportScreen.tsx
│   │   └── index.ts
│   ├── events/
│   │   ├── services/eventService.ts
│   │   ├── store/eventStore.ts
│   │   ├── hooks/useEvents.ts
│   │   ├── screens/
│   │   │   ├── EventsScreen.tsx
│   │   │   ├── CreateEventScreen.tsx
│   │   │   └── CalendarScreen.tsx
│   │   ├── __tests__/
│   │   │   └── eventService.test.ts  # 12 recurrence tests
│   │   └── index.ts
│   ├── attendance/
│   │   ├── services/attendanceService.ts
│   │   ├── store/attendanceStore.ts
│   │   ├── hooks/useAttendance.ts
│   │   ├── screens/
│   │   │   └── QuickMarkScreen.tsx
│   │   └── index.ts
│   ├── settings/
│   │   ├── screens/
│   │   │   └── SettingsScreen.tsx
│   │   └── index.ts              # Settings state is UI-local
│   └── export/
│       ├── services/googleSheetsService.ts
│       ├── store/exportStore.ts
│       ├── hooks/useExport.ts
│       └── index.ts
│
└── shared/                       # Cross-cutting UI code
    ├── ui/                       # Design system components
    ├── theme/                    # Colors, spacing, typography, ThemeContext
    ├── constants/                # App constants
    └── utils/
        ├── csvUtils.ts           # CSV export/import helpers
        └── __tests__/
            └── csvUtils.test.ts  # 9 CSV tests
```

## Data Flow (Linear — No Spaghetti)

```
Screen → useFeatureHook() → Store → Service → WatermelonDB

1. Screen imports ONLY the hook (e.g., useMembers())
2. Hook calls useDI() to get the service instance
3. Store holds state, delegates to service
4. Service performs WatermelonDB queries
5. All mutations logged via structured logger

Every feature follows this EXACT pattern.
```

## Dependency Injection

Services are created ONCE in `container.ts` via factory functions, then consumed everywhere via `useDI()`.

```
container.ts (createProductionContainer)
  ├── createAuthService()          ← src/features/auth/services/authService.ts
  ├── createMemberService()        ← src/features/members/services/memberService.ts
  ├── createEventService()         ← src/features/events/services/eventService.ts
  ├── createAttendanceService()    ← src/features/attendance/services/attendanceService.ts
  ├── createReportService()        ← src/features/dashboard/services/reportService.ts
  ├── createGoogleSheetsService()  ← src/features/export/services/googleSheetsService.ts
  └── createAutoSaveService()     ← src/core/services/autoSaveService.ts

In any hook:
  const { memberService } = useDI();  // Same instance, created once
```

## Key Principles

1. **Screens never import services or stores directly** — only hooks (exception: `useDI()` for query-only scenarios)
2. **DI** — one instance per service, created in `container.ts`
3. **Structured logging** — `logger.info('Module', 'Message', { data })` everywhere
4. **Error boundary** — prevents full app crashes
5. **Typed interfaces** — no `unknown` in service contracts
6. **Duplicate-free interfaces** — DI container re-exports from canonical source files (e.g., `IGoogleSheetsService = GoogleSheetsServiceInterface`)

## Testing

Tests use **Jest** with **ts-jest**. Pure-logic utilities (CSV, recurrence helpers) are fully covered. Services requiring WatermelonDB native modules need mock setup via `jest.mock()`.

| Suite | Location | Tests | Status |
|---|---|---|---|
| csvUtils | `shared/utils/__tests__/csvUtils.test.ts` | 9 | ✅ 9/9 |
| eventService | `features/events/__tests__/eventService.test.ts` | 12 | ✅ 12/12 |

Run:
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run test:ci    # CI mode with coverage
```

## Screen <-> Hook Mapping

| Screen | Location | Hook(s) |
|---|---|---|
| SplashScreen | `features/auth/screens/` | Navigation only |
| LoginScreen | `features/auth/screens/` | useAuth() |
| DashboardScreen | `features/dashboard/screens/` | useAuth() + useDashboard() + useEvents() |
| ReportsScreen | `features/dashboard/screens/` | useDashboard() + useMembers() |
| AbsenceReportScreen | `features/dashboard/screens/` | useMembers() |
| MemberListScreen | `features/members/screens/` | useMembers() |
| AddEditMemberScreen | `features/members/screens/` | useMembers() |
| MemberReportScreen | `features/members/screens/` | useMembers() + useDI().attendanceService |
| EventsScreen | `features/events/screens/` | useEvents() |
| CreateEventScreen | `features/events/screens/` | useEvents() + generateRecurrenceRule |
| CalendarScreen | `features/events/screens/` | useEvents() + useMembers() |
| QuickMarkScreen | `features/attendance/screens/` | useMembers() + useAttendance() |
| SettingsScreen | `features/settings/screens/` | useAuth() + useExport() + csvUtils |

## Migration Status

| Phase | Status | What |
|---|---|---|
| Phase 1 | ✅ | Core infrastructure + local auth |
| Phase 2 | ✅ | Zustand stores + hooks for all features |
| Phase 3 | ✅ | Real WatermelonDB services for all features |
| Phase 4 | ✅ | Google Sheets export + auto-save |
| Phase 5 | ✅ | All 13 screens wired + co-located. Zero MOCK data. |
| Phase 6 | ✅ | Unit tests — 21/21 passing with Jest + ts-jest |
| Phase 7 | ✅ | Cleanup — removed syncEngine (276 lines), unused settings store/hook, supabase/, 5 npm deps |