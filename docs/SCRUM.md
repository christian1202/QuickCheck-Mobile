# QuickCheck Mobile — Scrum Board

> Sprint length: 2 weeks | Team: 1-2 developers | June 17, 2026

---

## Current Sprint: Sprint 2 — Complete

**Goal:** Implement recurring events, CSV export/import, unit tests.

**Result:** EVT-06 done (RFC 5545 rules + auto-expand). C4, C5 done (CSV via Share API). Only ARC-09 remains.

---

## Product Backlog

### Epic 1: Authentication (DONE)

| ID | Story | Pts | Status |
|---|---|---|---|
| AUTH-01 | First-run admin account creation | 3 | ✅ |
| AUTH-02 | Email/password login (local, no cloud) | 5 | ✅ |
| AUTH-03 | Session persistence across restarts | 3 | ✅ |
| AUTH-04 | Logout with session clear | 2 | ✅ |
| AUTH-05 | Error message on wrong credentials | 2 | ✅ |
| AUTH-06 | Admin creates additional accounts | 3 | ✅ |
| AUTH-07 | Change password | 3 | ✅ |

### Epic 2: Dashboard (DONE)

| ID | Story | Pts | Status |
|---|---|---|---|
| DASH-01—07 | All dashboard stories | 21 | ✅ |

### Epic 3: Member Management (DONE)

| ID | Story | Pts | Status |
|---|---|---|---|
| MEM-01—06 | All member stories | 18 | ✅ |

### Epic 4: Event Management

| ID | Story | Pts | Status |
|---|---|---|---|
| EVT-01—05 | All event stories | 21 | ✅ |
| EVT-06 | Recurring events | 5 | ✅ RFC 5545 rules + auto-generate future instances |

### Epic 5: Attendance Tracking (DONE)

| ID | Story | Pts | Status |
|---|---|---|---|
| ATT-01—05 | All attendance stories | 21 | ✅ |

### Epic 6: Google Sheets Export (DONE)

| ID | Story | Pts | Status |
|---|---|---|---|
| SHEETS-01—08 | All Sheets stories | 37 | ✅ |

### Epic 7: Auto-Save (DONE)

| ID | Story | Pts | Status |
|---|---|---|---|
| SAVE-01—04 | All auto-save stories | 14 | ✅ |

### Epic 8: Settings (DONE)

| ID | Story | Pts | Status |
|---|---|---|---|
| SET-01—04 | All settings stories | 13 | ✅ |

### Epic 9: Architecture & Polish

| ID | Story | Pts | Status |
|---|---|---|---|
| ARC-01—08 | Architecture stories | 42 | ✅ |
| ARC-09 | Unit tests | 13 | Todo |

### Epic 10: CSV Export/Import

| ID | Story | Pts | Status |
|---|---|---|---|
| CSV-01 | Create csvUtils helpers (membersToCSV, eventsToCSV, parseCSVMembers) | 3 | ✅ |
| CSV-02 | Wire CSV export to Share API in SettingsScreen | 2 | ✅ |
| CSV-03 | Wire CSV import via paste + parse in SettingsScreen | 3 | ✅ |

---

## Sprint Board

### ✅ Done

```
All 9 Must-Haves (100%)
All 12 Should-Haves (100%)
11 of 12 Could-Haves (92%)
  C1 Calendar, C2 Recurring Events, C3 Absence Reports
  C4 CSV Export, C5 CSV Import, C6 Member Report Detail
  C8 Pull-to-Refresh, C9 At-Risk Detection, C10 Birthdays
  C11 Co-located Screens
All 13 screens co-located in features/*/screens/
Zero MOCK data — mockData.ts deleted
npm install + TypeScript 0 errors
README complete + 6 docs synced
```

### Todo

```
Unit tests (ARC-09, 13 pts)
```

---

## Definition of Done

- [x] Follows feature-based architecture pattern
- [x] Screen imports only feature hook (never store/service directly)
- [x] All service methods use typed interfaces (no `unknown`)
- [x] Logger used in every service method
- [x] Error, loading, and empty states handled
- [x] Works offline (WatermelonDB reads)
- [x] Zero MOCK data — `mockData.ts` deleted
- [x] Screens co-located in `features/*/screens/`
- [x] No TypeScript errors — `npx tsc --noEmit` passes with 0 errors