# QuickCheck Mobile — Architecture Documentation

## Overview

QuickCheck Mobile uses a **Feature-Based Clean Architecture** with unidirectional data flow. This architecture is designed to be scalable, easy to debug, maintain, and test.

## Directory Structure

```
src/
├── app/                          # App-level setup
│   ├── AppProviders.tsx          # Provider tree (ErrorBoundary → DI → Theme → Navigation)
│   ├── container.ts              # Production DI container (wires up real services)
│   └── ARCHITECTURE.md           # This file
│
├── core/                         # Core infrastructure (no business logic)
│   ├── types/
│   │   └── domain.ts             # All domain models, enums, error classes
│   ├── logging/
│   │   └── logger.ts             # Structured logging with transports
│   ├── errors/
│   │   └── ErrorBoundary.tsx     # React error boundary
│   ├── di/
│   │   └── container.ts          # DI container, hooks (useDI, useService)
│   ├── monitoring/
│   │   └── networkMonitor.ts     # Online/offline tracking
│   └── api/
│       └── syncEngine.ts         # Debounced sync with retry logic
│
├── features/                     # Feature modules (one per domain)
│   ├── auth/
│   │   ├── store/authStore.ts    # Zustand store (persisted)
│   │   ├── hooks/useAuth.ts      # Hook to wire store ↔ DI
│   │   └── index.ts              # Public API
│   ├── dashboard/
│   │   ├── store/dashboardStore.ts
│   │   ├── hooks/useDashboard.ts
│   │   └── index.ts
│   ├── members/
│   │   ├── store/memberStore.ts
│   │   ├── hooks/useMembers.ts
│   │   └── index.ts
│   ├── events/
│   │   ├── store/eventStore.ts
│   │   ├── hooks/useEvents.ts
│   │   └── index.ts
│   ├── attendance/
│   │   ├── store/attendanceStore.ts
│   │   ├── hooks/useAttendance.ts
│   │   └── index.ts
│   └── settings/
│       ├── store/settingsStore.ts
│       ├── hooks/useSettings.ts
│       └── index.ts
│
├── shared/                       # Cross-cutting UI code (existing, to be migrated)
│   ├── ui/                       # Design system components
│   ├── theme/                    # Colors, spacing, typography
│   └── navigation/               # Tab navigator, types
│
├── screens/                      # OLD — being migrated to feature/screens/
├── lib/                          # OLD — being migrated to core/ and feature/services/
├── data/                         # OLD — being migrated to feature/services/
├── db/                           # OLD — being migrated to core/database/
└── constants/                    # OLD — being migrated to shared/constants/
```

## Data Flow (Unidirectional)

```
┌─────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                   │
│  Screens → useFeatureHook() → Components                │
│  • Read data from hooks (which read from stores)        │
│  • Call actions via hooks                               │
│  • NEVER import services or stores directly             │
├─────────────────────────────────────────────────────────┤
│                       DOMAIN LAYER                       │
│  Hooks → Stores (Zustand) → Services (future)           │
│  • Hooks: wire stores to DI container                   │
│  • Stores: hold state, dispatch async actions           │
│  • Services: contain business rules (future phase)      │
├─────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                  │
│  DI Container | Logger | Sync Engine | Network Monitor  │
│  • Cross-cutting concerns, no business logic            │
└─────────────────────────────────────────────────────────┘
```

## Key Principles

### 1. Screens Never Import Services or Stores Directly
```typescript
// ❌ BAD - screen knows about implementation
import { useMemberStore } from '../store/memberStore';
import { supabase } from '../lib/supabase';

// ✅ GOOD - screen only uses the hook
import { useMembers } from '../features/members';
const { members, isLoading, fetchMembers } = useMembers();
```

### 2. Dependency Injection via React Context
```typescript
// At app startup (src/app/container.ts):
const container = { memberService, eventService, logger, ... };

// In any hook (src/features/members/hooks/useMembers.ts):
const { memberService, logger } = useDI();
```

### 3. Structured Logging Everywhere
```typescript
// Every action is logged with module name, message, and data
logger.info('MemberService', 'Creating member', { name: 'John' });
logger.error('SyncEngine', 'Sync failed', error, { attempt: 3 });
```

### 4. Error Boundary Prevents Full App Crashes
```typescript
// Wraps the entire app — any unhandled render error shows fallback UI
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Migration Status

| Phase | Status | What |
|---|---|---|
| Phase 1 | ✅ DONE | Core infrastructure (types, logger, DI, sync engine, network monitor, error boundary) |
| Phase 2 | ✅ DONE | Zustand stores for all 6 features |
| Phase 2 | ✅ DONE | Hooks wiring stores to DI container |
| Phase 3 | 🔜 NEXT | Real service implementations (auth, member, event, attendance, report) |
| Phase 4 | 🔜 NEXT | Migrate screens to features/*/screens/ using the new hooks |
| Phase 5 | 🔜 NEXT | Remove old src/screens/, src/lib/, src/data/, src/db/ |
| Phase 6 | 🔜 NEXT | Add unit tests for stores, services, and hooks |

## Adding a New Feature

1. Create `src/features/myFeature/`
2. Create `store/myFeatureStore.ts` (Zustand store)
3. Create `hooks/useMyFeature.ts` (hook wiring)
4. Create `index.ts` (barrel export)
5. Add service interface to `src/core/di/container.ts` if needed
6. Wire in `src/app/container.ts`
7. Create screens in `src/features/myFeature/screens/`

## Debugging

- **Zustand DevTools**: Open React Native Debugger → inspect all stores in real-time
- **Logger**: All actions logged with module tags — filter by module in console
- **Memory Transport**: `import { memoryTransport } from '@core/logging'` → `memoryTransport.getErrors()` to see recent errors
- **Error Boundary**: Shows stack trace in dev mode, friendly message in production