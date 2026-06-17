# QuickCheck Mobile — MoSCoW Prioritization

> Developed by: Christian Jay Basinillo | Local-first church attendance tracker

---

## Must Have (MVP — Cannot Release Without)

| # | Feature | Rationale | Status |
|---|---|---|---|
| M1 | **Google SSO Authentication** | Real Google Sign-In via `@react-native-google-signin/google-signin` v16. Secure + connects Google identity. | ✅ |
| M2 | **Profile Setup / Onboarding** | 3-slide tutorial → Google Sign-In → Profile setup ("What should we call you?"). | ✅ |
| M3 | **Member CRUD** | Core entity. Secretary needs to manage church members (add, edit, delete, list). | ✅ |
| M4 | **Event CRUD** | Core entity. Secretary creates events to track attendance against. | ✅ |
| M5 | **Attendance Marking** | The entire point of the app. Quick Mark screen for per-event attendance. | ✅ |
| M6 | **Attendance Submission** | Attendance must be saved to WatermelonDB for reports. | ✅ |
| M7 | **Dashboard** | Secretary's home screen. Shows key metrics from real DB data. No MOCK. | ✅ |
| M8 | **Offline-First** | Churches may have poor internet. All CRUD works without connection via WatermelonDB. | ✅ |
| M9 | **Secretary Settings** | Configure church name, force sync to Sheets, export CSV, and logout. Accessible via gear icon in Dashboard header. | ✅ |

---

## Should Have (Important — Adds Significant Value)

| # | Feature | Rationale | Status |
|---|---|---|---|
| S1—S12 | All Should-Have features | Google Sheets, Auto-Save, Theme, DI, Logging, Error Boundary | ✅ |

---

## Could Have (Nice to Have — Adds Polish)

| # | Feature | Rationale | Status |
|---|---|---|---|
| C1 | **Calendar View** | Visual event browsing. | ✅ |
| C2 | **Recurring Events** | RFC 5545 rules, auto-generate future instances. | ✅ |
| C3 | **Absence Reports** | Members submit reasons for absence. | ✅ |
| C4 | **CSV Export** | Share members as CSV via system Share sheet. | ✅ |
| C5 | **CSV Import** | Paste CSV to bulk import members. | ✅ |
| C6 | **Member Report Detail Screen** | Individual attendance history. | ✅ |
| C7 | **PIN / Biometric Login** | Quick login. Convenience, not critical. | Todo |
| C8 | **Pull-to-Refresh on Dashboard** | Nice UX. | ✅ |
| C9 | **At-Risk Member Detection** | Auto-flag members below threshold. | ✅ |
| C10 | **Birthday Tracking** | Birthday display on dashboard. | ✅ |
| C11 | **Co-located Screens** | Screens in `src/features/*/screens/`. | ✅ |
| C12 | **Unit Tests** | Jest + ts-jest. csvUtils (9) + eventService (12). 21/21 passing. `npm test`. | ✅ |
| C13 | **Local Notifications** | Reminders for upcoming events or missing members. | Planned |
| C14 | **Extended Member Profile** | Add Address and Google Maps link (Phone Number already exists). | ✅ |
| C15 | **One-Tap SMS Follow-ups** | Native integration to send pre-filled SMS to absentees. | Planned |
| C16 | **Household Grouping** | Group family members to mark attendance with a single tap. | ✅ |
| C17 | **First-Time Visitor Mode** | Quick-add form (Name + Phone) that triggers follow-up reminders. | Planned |
| C18 | **Visitation Dashboard** | Dedicated screen tracking who needs member care visits based on absence/status. | ✅ |
| C19 | **In-App Tutorial & Onboarding** | Interactive walkthrough and onboarding flow for first-time users. | Planned |
| C20 | **UX & Animation Polish** | Fluid screen transitions, beautiful empty states, and Lottie reward animations (Confetti). | ✅ |
| C21 | **App Store & Play Store Deployment** | Build production bundles via Expo EAS and publish to Apple App Store and Google Play Store. | Planned |
| C22 | **In-App Bug Reporting** | A "Report an Issue" button in Settings that sends logs and user feedback directly to the developer. | Planned |
| C23 | **Complete Mock Data Removal** | Perform a full UI audit to ensure absolutely no hardcoded mock data remains and everything is driven by WatermelonDB. | ✅ |

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
| W8 | Supabase Integration | Removed — project is local-first. |
| W9 | Internationalization (i18n) | English-only MVP. |
| W10 | E2E Tests | High effort. Unit tests first. |

---

## MoSCoW Summary

```
MUST (9)      ██████████  100% done (M1-M9 all ✅)
SHOULD (12)   ██████████  100% done
COULD (23)    ██████░░░░   65% done (C1-C12 ✅ except C7. C18, C20, C23 ✅)
WON'T (10)    ░░░░░░░░░░   0% (by design)
```

### Release Criteria

- [x] User can sign in with Google SSO
- [x] User can log in and log out
- [x] Session persists across app restarts
- [x] Secretary can add, edit, delete, and list members
- [x] Secretary can create events (including recurring with auto-expansion)
- [x] Secretary can mark attendance per event
- [x] Attendance is saved to WatermelonDB
- [x] Dashboard shows real data from DB (no MOCK)
- [x] All 13 screens wired to real services — zero MOCK data
- [x] Screens co-located into `features/*/screens/`
- [x] Google Sheets export working
- [x] CSV export/import working (Share API)
- [x] Auto-save prevents data loss
- [x] TypeScript compiles clean — 0 errors
- [x] Unit tests — 21 passing with Jest (csvUtils 9 + eventService 12)
- [x] Orphaned code removed — syncEngine, unused settings store/hook, supabase/, 5 npm deps