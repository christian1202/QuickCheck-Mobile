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
| S1 | **Google Sheets — OAuth Connect** | Secretary needs to export data for church reporting. | ✅ |
| S2 | **Google Sheets — Export Members** | Push member list to Sheets. | ✅ |
| S3 | **Google Sheets — Export Attendance** | Push attendance records to Sheets. | ✅ |
| S4 | **Google Sheets — Export Events** | Push event list for planning. | ✅ |
| S5 | **Google Sheets — Create/Link Sheet** | Create or link spreadsheets from the app. | ✅ |
| S6 | **Auto-Save Engine** | Debounced saves prevent data loss. | ✅ |
| S7 | **Auto-Save → Google Sheets Sync** | Auto-push to linked Google Sheet on save. | ✅ |
| S8 | **Dark/Light Theme** | Accessibility and user preference. | ✅ |
| S9 | **Search & Filter Members** | Essential for churches with 100+ members. | ✅ |
| S10 | **Typed DI Interfaces** | Zero `unknown` in service contracts. | ✅ |
| S11 | **Structured Logging** | Every service method logs info/error. | ✅ |
| S12 | **Error Boundary** | Prevents full app crashes. | ✅ |

---

## Could Have (Nice to Have — Adds Polish)

| # | Feature | Rationale | Status |
|---|---|---|---|
| C1 | **Calendar View** | Visual event browsing. | ✅ |
| C2 | **Recurring Events** | RFC 5545 rules, auto-generate future instances. | ✅ |
| C3 | **Absence Reports** | Members submit reasons for absence. | ✅ |
| C4 | **CSV Export** | Share members as CSV via system share sheet. | ✅ csvUtils.membersToCSV + Share API |
| C5 | **CSV Import** | Paste CSV to bulk import members. | ✅ csvUtils.parseCSVMembers + memberService |
| C6 | **Member Report Detail Screen** | Individual attendance history. | ✅ |
| C7 | **PIN / Biometric Login** | Quick login. Convenience, not critical. | Todo |
| C8 | **Pull-to-Refresh on Dashboard** | Nice UX. | ✅ |
| C9 | **At-Risk Member Detection** | Auto-flag members below threshold. | ✅ |
| C10 | **Birthday Tracking** | Birthday display on dashboard. | ✅ |
| C11 | **Co-located Screens** | Screens in `src/features/*/screens/`. | ✅ |
| C12 | **Unit Tests** | Essential for long-term maintenance. | Todo |

---

## Won't Have Now (Future — Deliberately Deferred)

| # | Feature | Why Deferred |
|---|---|---|
| W1 | Push Notifications | Requires Firebase + server. |
| W2 | Real-Time Multi-Device Sync | Conflicts with local-first. |
| W3 | Admin Web Dashboard | Separate project. |
| W4 | Multi-Church Support | Significant schema changes. |
| W5 | Advanced Analytics | PDF reports with graphs. |
| W6 | Member Photo Upload | Camera/gallery integration. |
| W7 | QR Code Check-In | QR generation + scanning. |
| W8 | Supabase Integration | Replaced by local-first. |
| W9 | Internationalization (i18n) | English-only MVP. |
| W10 | E2E Tests | High effort. Unit tests first. |

---

## MoSCoW Summary

```
MUST (9)      ██████████  100% done
SHOULD (12)   ██████████  100% done
COULD (12)    ██████████  92% done  (C1-C6✅ C8-C11✅, only C7, C12 remain)
WON'T (10)    ░░░░░░░░░░   0% (by design)
```

### Release Criteria

- [x] User can create admin account on first launch
- [x] User can log in and log out
- [x] Session persists across app restarts
- [x] Secretary can add, edit, delete, and list members
- [x] Secretary can create events (including recurring with auto-expansion)
- [x] Secretary can mark attendance per event
- [x] Attendance is saved to WatermelonDB
- [x] Dashboard shows real data from DB (no MOCK)
- [x] All 13 screens wired to real services — zero MOCK data
- [x] Screens co-located into `features/*/screens/`
- [x] `mockData.ts` deleted
- [x] Google Sheets export working
- [x] CSV export/import working
- [x] Auto-save prevents data loss
- [x] TypeScript compiles clean — 0 errors