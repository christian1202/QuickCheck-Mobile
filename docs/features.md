# QuickCheck Mobile — Feature List
> Developed by: Christian Jay Basinillo | Local-first architecture. All data in WatermelonDB. No cloud dependency.

---

## 1. Authentication & User Management

| Feature | Description |
|---|---|
| Google Sign-In | Real Google SSO via `@react-native-google-signin/google-signin` v16 |
| Onboarding Flow | 3-slide tutorial → Google Sign-In → Profile setup |
| Session Persistence | expo-secure-store encrypted device keychain |
| First-Run Detection | Automatic first-launch onboarding |
| Role-Based Access | Admin, Secretary, Member, Viewer |
| Logout | Google Sign-Out + session termination |

## 2. Dashboard

| Feature | Data Source |
|---|---|
| Personalized Greeting | useAuth() → user fullName |
| Active Members Stat | useDashboard() → real DB count |
| Monthly Attendance Avg | useDashboard() → computed from DB |
| Attendance Trend Chart | useDashboard() → 6-month bar chart |
| Status Distribution | useDashboard() → present/late/absent |
| Ministry Group Breakdown | useDashboard() → per-group rates |
| At-Risk Members | useDashboard() → members <70% |
| Birthdays This Week | useDashboard() → filtered from DB |
| Today's/Next Event | useEvents() → first upcoming event |
| Upcoming Schedule | useEvents() → next 3 events |
| Pull-to-Refresh | Refresh dashboard + events from DB |
| Settings Access | Gear icon in top-right header → navigates to Settings |

## 3. Member Management

| Feature | Service |
|---|---|
| CRUD Operations | memberService → WatermelonDB |
| Search & Filter | memberService.getMembers(filters) |
| Status Management | Active/Inactive/On Leave/Transferred |

## 4. Event Management

| Feature | Service |
|---|---|
| CRUD Operations | eventService → WatermelonDB |
| Event Types | Sunday Service, Prayer Meeting, etc. |
| Calendar View | Visual event browsing (useEvents + useMembers) |
| Recurring Events | RFC 5545 rules, auto-generate future instances |

## 5. Attendance Tracking

| Feature | Service |
|---|---|
| Quick Mark | attendanceService.markAttendance() |
| Per-Event Query | attendanceService.getAttendanceForEvent() |
| Per-Member Query | attendanceService.getAttendanceForMember() |

## 6. Member Reports & Analytics

| Feature | Service |
|---|---|
| Member Report Detail | useMembers() + attendanceService (via useDI) |
| Reports Dashboard | useDashboard() + useMembers() |
| Absence Filing | useMembers() |

## 7. Google Sheets Export

| Feature | Description |
|---|---|
| OAuth 2.0 | expo-auth-session Google authentication |
| Token Storage | expo-secure-store encrypted, auto-refresh |
| Export Members | Full member list to Sheets |
| Export Attendance | Attendance records with member/event names |
| Export Events | Event list to Sheets |
| Export All | One-tap all data export |
| Create/Link Sheets | Create new or link existing by ID |

## 8. Auto-Save

| Feature | Description |
|---|---|
| Debounced Saves | 3s default, 15s max wait |
| Manual Save | triggerSave() for immediate save |
| scheduleSave() | Multiple calls collapse into one save |
| Google Sheets Sync | Auto-push to linked sheet on save |

## 9. CSV Export / Import

| Feature | Description |
|---|---|
| Export CSV | Share members as CSV via React Native `Share` API (csvUtils.membersToCSV) |
| Import CSV | Paste CSV content to bulk import members (csvUtils.parseCSVMembers) |

## 10. Settings

| Feature | Description |
|---|---|
| Profile Configuration | Editable User Name (WatermelonDB) and Church Name (AsyncStorage) |
| Dark/Light Mode | Theme toggle via useTheme().setThemeMode() |
| Google Sheets Setup | Connect, link, configure |
| Auto-Save Toggle | Enable/disable with Sheets sync option |
| CSV Export/Import | Members export/import directly in settings |
| Logout | Session termination |

Note: Settings state is managed locally in the screen via React `useState`. No Zustand store for settings (keeps it simple and avoids unread AsyncStorage writes).

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 55) |
| Language | TypeScript 5.x |
| State | Zustand + AsyncStorage |
| Local DB | WatermelonDB (SQLite) |
| Auth | Google Sign-In (`@react-native-google-signin/google-signin` v16) + expo-secure-store |
| Google Sheets | OAuth 2.0 + REST API v4 |
| CSV | Custom parser/writer (no external deps) |
| Auto-Save | Custom debounced engine |
| Navigation | React Navigation 7 |
| DI | Custom React Context DI |
| Logging | Structured logger with transports |
| Testing | Jest + ts-jest |

## Architecture Pattern

```
Every feature follows:
  services/  →  store/  →  hooks/  →  screens/

Data flow:
  Screen → useFeatureHook() → useDI() → Service → WatermelonDB

Services created ONCE in container.ts via factory functions.
Consumed everywhere via useDI(). No duplication. No spaghetti.

All 13 screens co-located in features/*/screens/. Zero MOCK data.
```

## Screen → Hook Mapping

| Screen | Location | Hooks Used |
|---|---|---|
| SplashScreen | `features/auth/screens/` | Navigation only |
| TutorialScreen | `features/auth/screens/` | useAuth() |
| ProfileSetupScreen | `features/auth/screens/` | useAuth() |
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
| SettingsScreen | `features/settings/screens/` | useAuth() + useExport() + useMembers() + useEvents() + csvUtils |

## Testing

Tests use **Jest** with **ts-jest** for TypeScript integration.

| Suite | Tests | Status |
|---|---|---|
| csvUtils (`shared/utils/__tests__/`) | 9 | ✅ 9/9 |
| eventService recurrence (`features/events/__tests__/`) | 12 | ✅ 12/12 |

Run:
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run test:ci    # CI mode with coverage report
```

## Recent Cleanup (June 2026)

| Removed | Reason |
|---|---|
| `src/core/api/syncEngine.ts` (276 lines) | Unused — container.ts creates noop inline |
| `src/features/settings/hooks/useSettings.ts` | Unused — SettingsScreen uses local useState |
| `src/features/settings/store/settingsStore.ts` | Unused — no screen consumed Zustand settings store |
| `supabase/` directory (~20 files) | Orphaned — project is local-first, no cloud dependency |
| `bcryptjs` (removed) | Replaced by Google Sign-In SSO — no more local password hashing |
| `date-fns`, `expo-sharing`, `react-native-svg`, `react-native-web` | Never imported in source |

## 13. Planned Features (Roadmap)

The following features have been planned for future sprints to enhance pastoral care and administration:

| Feature | Description |
|---|---|
| **Local Notifications** | Reminders for upcoming events or missing members, scheduled locally on the device. |
| **Extended Member Profile** | Adding 'Address' and 'Google Maps link' fields alongside the existing Contact Number. |
| **One-Tap SMS Follow-ups** | Native integration to send pre-filled SMS/WhatsApp messages to absentees directly from the app. |
| **Household Grouping** | Grouping family members together to mark their attendance with a single tap. |
| **First-Time Visitor Mode** | A quick-add form (Name + Phone only) that automatically triggers follow-up reminders. |
| **Visitation Dashboard** | A dedicated dashboard tracking who needs pastoral visits based on consecutive absences and status. |
| **In-App Tutorial & Onboarding** | Welcome carousel and interactive tooltips to guide new secretaries through the app's core features. |
| **UX & Animation Polish** | Fluid screen transitions, beautiful illustrated empty states, and Lottie reward animations (e.g., Confetti) to make the app feel premium. |
| **Store Deployment (EAS)** | Production builds for iOS and Android, deployed directly to the Apple App Store and Google Play Store. |
| **In-App Bug Reporting** | A dedicated support form in Settings allowing users to report bugs or send feedback directly to the developer (with automatically attached error logs). |
| **Complete Mock Data Removal** | A comprehensive UI audit to purge any residual hardcoded placeholders so every screen reflects 100% real database records. |