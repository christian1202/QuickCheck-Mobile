# QuickCheck Mobile — MoSCoW Prioritization

> June 17, 2026 | Local-first church attendance tracker

---

## Must Have (MVP — Cannot Release Without)

| # | Feature | Rationale | Status |
|---|---|---|---|
| M1 | **Local Login / Logout** | Users must authenticate to use the app. Email + password via bcryptjs, stored in WatermelonDB. No cloud dependency. | ✅ |
| M2 | **Session Persistence** | Users shouldn't re-login every time they open the app. Session stored in expo-secure-store. | ✅ |
| M3 | **Member CRUD** | Core entity. Secretary needs to manage church members (add, edit, delete, list). | ✅ |
| M4 | **Event CRUD** | Core entity. Secretary creates events to track attendance against. | ✅ |
| M5 | **Attendance Marking** | The entire point of the app. Quick Mark screen for per-event attendance. | ✅ |
| M6 | **Attendance Submission** | Attendance must be saved to WatermelonDB for reports. | ✅ |
| M7 | **Dashboard** | Secretary's home screen. Shows key metrics from real DB data. No MOCK. | ✅ |
| M8 | **Offline-First** | Churches may have poor internet. All CRUD works without connection via WatermelonDB. | ✅ |
| M9 | **Settings / Logout** | Users need a way to log out and configure basic preferences. | ✅ |

---

## Should Have (Important — Adds Significant Value)

| # | Feature | Rationale | Status |
|---|---|---|---|
| S1 | **Google Sheets — OAuth Connect** | Secretary needs to export data for church reporting. OAuth 2.0 via expo-auth-session. | ✅ |
| S2 | **Google Sheets — Export Members** | Push member list to Sheets with name, role, group, status, attendance rate. | ✅ |
| S3 | **Google Sheets — Export Attendance** | Push attendance records with member, event, date, status. | ✅ |
| S4 | **Google Sheets — Export Events** | Push event list for planning. | ✅ |
| S5 | **Google Sheets — Create/Link Sheet** | Secretary can create new spreadsheet or link existing one from the app. | ✅ |
| S6 | **Auto-Save Engine** | Debounced saves prevent data loss. scheduleSave() for debounced requests, triggerSave() for immediate. | ✅ |
| S7 | **Auto-Save → Google Sheets Sync** | When enabled, auto-save pushes data to linked Google Sheet. No manual export needed. | ✅ |
| S8 | **Dark/Light Theme** | Accessibility and user preference. | ✅ |
| S9 | **Search & Filter Members** | Essential for churches with 100+ members. | ✅ |
| S10 | **Typed DI Interfaces** | Prevents bugs at compile time. Zero `unknown` in service contracts. | ✅ |
| S11 | **Structured Logging** | Every service method logs info/error. Essential for debugging in production. | ✅ |
| S12 | **Error Boundary** | Prevents a single component crash from taking down the entire app. | ✅ |

---

## Could Have (Nice to Have — Adds Polish)

| # | Feature | Rationale | Status |
|---|---|---|---|
| C1 | **Calendar View** | Visual event browsing. Lower priority than list view. | ✅ Co-located in `features/events/screens/` |
| C2 | **Recurring Events** | Weekly/monthly patterns. Complex logic, can be done manually for MVP. | Todo |
| C3 | **Absence Reports** | Members submit reasons for absence with proof upload. | ✅ Co-located in `features/dashboard/screens/` |
| C4 | **CSV Export** | Alternative to Google Sheets. Useful for offline-only users. | Todo |
| C5 | **CSV Import** | Bulk member import. One-time setup task, not daily use. | Todo |
| C6 | **Member Report Detail Screen** | Individual attendance history view. | ✅ Co-located in `features/members/screens/` |
| C7 | **PIN / Biometric Login** | Quick login for secretary. Convenience, not critical. | Todo |
| C8 | **Pull-to-Refresh on Dashboard** | Nice UX. Data already real-time from WatermelonDB. | ✅ |
| C9 | **At-Risk Member Detection** | Automated flagging of members below attendance threshold. | ✅ |
| C10 | **Birthday Tracking** | Birthday display on dashboard. Nice community feature. | ✅ |
| C11 | **Co-located Screens** | Screens moved from `src/screens/` into `src/features/*/screens/`. Clean architecture. | ✅ |
| C12 | **Unit Tests** | Essential for long-term maintenance. Deferred while features stabilize. | Todo |

---

## Won't Have Now (Future — Deliberately Deferred)

| # | Feature | Why Deferred |
|---|---|---|
| W1 | **Push Notifications** | Requires Firebase/Expo Push + server. No cloud dependency by design. |
| W2 | **Real-Time Multi-Device Sync** | Requires Supabase/cloud backend. Conflicts with local-first architecture. |
| W3 | **Admin Web Dashboard** | Separate project. Mobile-only MVP. |
| W4 | **Multi-Church Support** | Significant schema changes (tenant isolation). Single-church MVP. |
| W5 | **Advanced Analytics** | Charts, exportable PDF reports with embedded graphs. Nice-to-have for future. |
| W6 | **Member Photo Upload** | Camera/gallery integration + image storage. Adds complexity. |
| W7 | **QR Code Check-In** | Members scan QR to self-check-in. Requires QR generation + scanning infrastructure. |
| W8 | **Supabase Integration** | Was originally planned. Removed in favor of local-first. `supabase/` directory kept for SQL reference. |
| W9 | **Internationalization (i18n)** | Single-language (English) MVP. Filipino support in future. |
| W10 | **E2E Tests** | Detox/Appium setup is high effort. Unit tests first. |

---

## MoSCoW Summary

```
MUST (9)      ██████████  100% done
SHOULD (12)   ██████████  100% done
COULD (12)    ███████░░░  67% done  (C1✅ C3✅ C6✅ C8✅ C9✅ C10✅ C11✅, rest Todo)
WON'T (10)    ░░░░░░░░░░   0% (by design)
```

### MVP Scope = All Must-Haves + All Should-Haves

Current MVP includes all Must-Haves and all Should-Haves — both 100% complete. Eight of twelve Could-Haves are done (67%).

### Release Criteria

- [x] User can create admin account on first launch
- [x] User can log in and log out
- [x] Session persists across app restarts
- [x] Secretary can add, edit, delete, and list members
- [x] Secretary can create events
- [x] Secretary can mark attendance per event
- [x] Attendance is saved to WatermelonDB
- [x] Dashboard shows real data from DB (no MOCK)
- [x] All 13 screens wired to real services — zero MOCK data
- [x] Screens co-located into `features/*/screens/` directories
- [x] `src/screens/` directory removed
- [x] `mockData.ts` deleted — zero consumers
- [x] Secretary can export data to Google Sheets
- [x] Auto-save prevents data loss
- [x] TypeScript compiles clean — `npx tsc --noEmit` passes with 0 errors