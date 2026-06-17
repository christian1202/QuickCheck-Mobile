# QuickCheck Mobile — Scrum Board

> Sprint length: 2 weeks | Team: 1-2 developers | June 17, 2026

---

## Current Sprint: Sprint 1 — MVP Hardening (COMPLETE)

**Goal:** Fix bugs, replace mock data with real DB services, add Google Sheets + auto-save.

**Result:** All Must-Haves and Should-Haves complete. All 13 screens wired + co-located. Zero MOCK data. TypeScript 0 errors.

---

## Product Backlog

### Epic 1: Authentication

| ID | Story | Pts | Status |
|---|---|---|---|
| AUTH-01 | First-run admin account creation | 3 | ✅ |
| AUTH-02 | Email/password login (local, no cloud) | 5 | ✅ |
| AUTH-03 | Session persistence across restarts | 3 | ✅ |
| AUTH-04 | Logout with session clear | 2 | ✅ |
| AUTH-05 | Error message on wrong credentials | 2 | ✅ |
| AUTH-06 | Admin creates additional accounts | 3 | ✅ |
| AUTH-07 | Change password | 3 | ✅ |

### Epic 2: Dashboard

| ID | Story | Pts | Status |
|---|---|---|---|
| DASH-01 | Personalized greeting with name | 2 | ✅ |
| DASH-02 | Active member count from DB | 3 | ✅ |
| DASH-03 | Monthly attendance average | 3 | ✅ |
| DASH-04 | 6-month trend chart | 5 | ✅ |
| DASH-05 | At-risk members list | 3 | ✅ |
| DASH-06 | Birthdays this week | 2 | ✅ |
| DASH-07 | Pull-to-refresh | 3 | ✅ |

### Epic 3: Member Management

| ID | Story | Pts | Status |
|---|---|---|---|
| MEM-01 | List all members | 3 | ✅ |
| MEM-02 | Search by name | 3 | ✅ |
| MEM-03 | Filter by status | 2 | ✅ |
| MEM-04 | Add new member | 5 | ✅ |
| MEM-05 | Edit member | 3 | ✅ |
| MEM-06 | Delete member | 2 | ✅ |

### Epic 4: Event Management

| ID | Story | Pts | Status |
|---|---|---|---|
| EVT-01 | List events | 3 | ✅ |
| EVT-02 | Create event | 5 | ✅ |
| EVT-03 | Edit event | 3 | ✅ |
| EVT-04 | Delete event | 2 | ✅ |
| EVT-05 | Calendar view | 8 | ✅ Co-located in `features/events/screens/` |
| EVT-06 | Recurring events | 5 | Todo |

### Epic 5: Attendance Tracking

| ID | Story | Pts | Status |
|---|---|---|---|
| ATT-01 | Start Quick Mark session | 5 | ✅ |
| ATT-02 | Toggle status per member | 3 | ✅ |
| ATT-03 | Mark all present | 2 | ✅ |
| ATT-04 | Real-time counters | 3 | ✅ |
| ATT-05 | Submit to DB | 5 | ✅ |

### Epic 6: Google Sheets Export

| ID | Story | Pts | Status |
|---|---|---|---|
| SHEETS-01 | OAuth connect Google | 8 | ✅ |
| SHEETS-02 | Export members | 5 | ✅ |
| SHEETS-03 | Export attendance | 5 | ✅ |
| SHEETS-04 | Export events | 3 | ✅ |
| SHEETS-05 | Export all at once | 3 | ✅ |
| SHEETS-06 | Create new sheet | 5 | ✅ |
| SHEETS-07 | Link existing sheet | 3 | ✅ |
| SHEETS-08 | Disconnect Google | 2 | ✅ |

### Epic 7: Auto-Save

| ID | Story | Pts | Status |
|---|---|---|---|
| SAVE-01 | Periodic auto-save to device | 5 | ✅ |
| SAVE-02 | Enable/disable toggle | 2 | ✅ |
| SAVE-03 | Auto-push to Google Sheets | 5 | ✅ |
| SAVE-04 | Manual save trigger | 2 | ✅ |

### Epic 8: Settings

| ID | Story | Pts | Status |
|---|---|---|---|
| SET-01 | Dark/light mode | 3 | ✅ |
| SET-02 | Google Sheets config UI | 5 | ✅ |
| SET-03 | Auto-save config UI | 3 | ✅ |
| SET-04 | Logout button | 2 | ✅ |

### Epic 9: Architecture & Polish

| ID | Story | Pts | Status |
|---|---|---|---|
| ARC-01 | Real WatermelonDB services (no stubs) | 8 | ✅ |
| ARC-02 | Typed DI interfaces (no `unknown`) | 5 | ✅ |
| ARC-03 | Dashboard uses hooks (no MOCK) | 3 | ✅ |
| ARC-04 | Fix authService getSessionUser() | 3 | ✅ |
| ARC-05 | Fix autoSaveService requestSave() | 2 | ✅ |
| ARC-06 | Co-locate screens into features | 8 | ✅ All 13 screens in `features/*/screens/` |
| ARC-07 | Standardize exports | 3 | ✅ Removal of `src/screens/` + `mockData.ts` |
| ARC-08 | Loading/error/empty states | 5 | ✅ Empty states added to all screens |
| ARC-09 | Unit tests | 13 | Todo |

### Epic 10: Secondary Screens Wired (Sprint 1 Extension)

| ID | Story | Pts | Status |
|---|---|---|---|
| SEC-01 | Wire CalendarScreen to useEvents() + useMembers() | 5 | ✅ |
| SEC-02 | Wire ReportsScreen to useDashboard() + useMembers() | 3 | ✅ |
| SEC-03 | Wire MemberReportScreen to useMembers() + attendanceService | 5 | ✅ |
| SEC-04 | Wire AbsenceReportScreen to useMembers() | 2 | ✅ |
| SEC-05 | Remove mockData.ts from codebase | 3 | ✅ Deleted — zero consumers |

---

## Sprint Board

### ✅ Done (Sprint 1 + ARC-06)

```
Auth service (bcryptjs + WatermelonDB)
All 6 feature stores + hooks
MemberService, EventService, AttendanceService, ReportService (real DB CRUD)
GoogleSheetsService (OAuth + Sheets API)
AutoSaveService (debounced + scheduleSave)
ExportStore + useExport hook
npm install — all dependencies restored
TypeScript — npx tsc --noEmit passes with 0 errors
All 13 screens co-located in features/*/screens/ — zero MOCK
src/screens/ directory removed
mockData.ts deleted
```

### Todo (Sprint 2+)

```
Recurring events (EVT-06)
CSV export/import implementation
Unit tests (ARC-09)
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