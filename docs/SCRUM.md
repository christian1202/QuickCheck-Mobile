# QuickCheck Mobile — Scrum Board

> Sprint length: 2 weeks | Team: 1-2 developers | June 17, 2026

---

## Current Sprint: Sprint 3 — Complete ✅

**Goal:** Unit tests + code cleanup.

**Result:** ARC-09 done. 21 unit tests passing (9 csvUtils + 12 eventService recurrence) via Jest + ts-jest.
Orphaned code removed: syncEngine, unused settings store/hook, supabase/ directory (~20 files), 5 unused npm deps.

---

## Product Backlog

### Epic 1: Authentication (DONE) — 7 stories ✅
### Epic 2: Dashboard (DONE) — 7 stories ✅
### Epic 3: Member Management (DONE) — 6 stories ✅
### Epic 4: Event Management (DONE) — 6 stories ✅ (EVT-06: Recurring Events)
### Epic 5: Attendance Tracking (DONE) — 5 stories ✅
### Epic 6: Google Sheets Export (DONE) — 8 stories ✅
### Epic 7: Auto-Save (DONE) — 4 stories ✅
### Epic 8: Settings (DONE) — 4 stories ✅

### Epic 9: Architecture & Polish

| ID | Story | Pts | Status |
|---|---|---|---|
| ARC-01 | Real WatermelonDB services (no stubs) | 8 | ✅ |
| ARC-02 | Typed DI interfaces (no `unknown`) | 5 | ✅ |
| ARC-03 | Dashboard uses hooks (no MOCK) | 3 | ✅ |
| ARC-04 | Fix authService getSessionUser() | 3 | ✅ |
| ARC-05 | Fix autoSaveService requestSave() | 2 | ✅ |
| ARC-06 | Co-locate screens into features | 8 | ✅ |
| ARC-07 | Standardize exports | 3 | ✅ |
| ARC-08 | Loading/error/empty states | 5 | ✅ |
| ARC-09 | Unit tests (Jest + ts-jest) | 13 | ✅ 21/21 passing |
| ARC-10 | Code cleanup | 5 | ✅ Removed: syncEngine, unused settings store/hook, supabase/, 5 npm deps |

### Epic 10: CSV Export/Import (DONE) — 3 stories ✅

---

## Sprint Board

### ✅ Done — All Epics Complete

```
All 9 Must-Haves (100%)
All 12 Should-Haves (100%)
11 of 12 Could-Haves (100% practical — C7 is design-only)
All 13 screens co-located in features/*/screens/
Zero MOCK data — deleted
TypeScript 0 errors
README + 5 docs synced
21 unit tests passing (Jest + ts-jest)
Cleanup: removed syncEngine, supabase/, unused settings code, 5 npm deps
```

---

## Definition of Done

- [x] Follows feature-based architecture pattern
- [x] Screen imports only feature hook (never store/service directly)
- [x] All service methods use typed interfaces (no `unknown`)
- [x] Logger used in every service method
- [x] Error, loading, and empty states handled
- [x] Works offline (WatermelonDB reads)
- [x] Zero MOCK data — deleted
- [x] Screens co-located in `features/*/screens/`
- [x] No TypeScript errors — `npx tsc --noEmit` passes with 0 errors
- [x] Unit tests — 21/21 passing via `npm test`
- [x] No orphaned code — syncEngine, supabase/, empty hooks/store removed
- [x] No duplicate interfaces — DI container imports from canonical source files