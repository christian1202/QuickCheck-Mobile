# QuickCheck Mobile

A **local-first church attendance tracker** built with React Native (Expo SDK 55) + WatermelonDB. No cloud dependency.

---

## Status

| Priority | Done | Total | % |
|---|---|---|---|
| Must Have | 9 | 9 | 100% |
| Should Have | 12 | 12 | 100% |
| Could Have | 8 | 12 | 67% |

TypeScript: **0 errors**. All 13 screens wired to real services, co-located in `src/features/*/screens/`.

---

## Features

- **Local Auth** — Email/password login via bcryptjs + WatermelonDB, session in expo-secure-store
- **Member CRUD** — Add, edit, delete, search, and filter members
- **Event Management** — Create/edit/delete events with calendar view
- **Attendance Tracking** — Quick Mark per-event attendance with toggle statuses
- **Dashboard** — Real-time metrics, attendance trends, at-risk members, birthdays
- **Google Sheets Export** — OAuth 2.0 + Sheets API v4, create/link spreadsheets
- **Auto-Save** — Debounced save engine with Google Sheets sync
- **Dark/Light Theme** — Toggle in settings
- **Reports & Analytics** — Member report detail, absence filing, analytics dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 55) |
| Language | TypeScript 5.x |
| State | Zustand + AsyncStorage |
| Local DB | WatermelonDB (SQLite) |
| Auth | bcryptjs + expo-secure-store |
| Google Sheets | OAuth 2.0 + REST API v4 |
| Navigation | React Navigation 7 |
| DI | Custom React Context DI |
| Logging | Structured logger with transports |

---

## Architecture

Feature-Based Clean Architecture with unidirectional data flow:

```
src/features/{feature}/
├── services/    # Business logic (WatermelonDB queries)
├── store/       # Zustand state management
├── hooks/       # Hook to wire store ↔ DI
└── screens/     # Screen components
```

Data flow: **Screen → useFeatureHook() → Store → Service → WatermelonDB**

All services created once in `src/app/container.ts` and consumed via `useDI()`.

Full architecture docs: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Getting Started

### Prerequisites
- Node.js 22+
- npm

### Install

```bash
git clone https://github.com/christian1202/QuickCheck-Mobile.git
cd QuickCheck-Mobile
npm install
```

### Run

```bash
npx expo start
```

### Type Check

```bash
npx tsc --noEmit
```

---

## Documentation

| Doc | Description |
|---|---|
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Directory structure, data flow, DI, principles |
| [`features.md`](docs/features.md) | Complete feature list with data sources and services |
| [`SCRUM.md`](docs/SCRUM.md) | Scrum board — all epics, stories, points, and status |
| [`MOSCOW.md`](docs/MOSCOW.md) | MoSCoW prioritization and release criteria |
| [`status.md`](docs/status.md) | Current project status, screen/hook mapping, dependencies |

---

## Screens

| Screen | Location | Hook(s) |
|---|---|---|
| SplashScreen | `features/auth/screens/` | Navigation only |
| LoginScreen | `features/auth/screens/` | useAuth() |
| DashboardScreen | `features/dashboard/screens/` | useAuth() + useDashboard() + useEvents() |
| ReportsScreen | `features/dashboard/screens/` | useDashboard() + useMembers() |
| AbsenceReportScreen | `features/dashboard/screens/` | useMembers() |
| MemberListScreen | `features/members/screens/` | useMembers() |
| AddEditMemberScreen | `features/members/screens/` | useMembers() |
| MemberReportScreen | `features/members/screens/` | useMembers() + attendanceService |
| EventsScreen | `features/events/screens/` | useEvents() |
| CreateEventScreen | `features/events/screens/` | useEvents() |
| CalendarScreen | `features/events/screens/` | useEvents() + useMembers() |
| QuickMarkScreen | `features/attendance/screens/` | useMembers() + useAttendance() |
| SettingsScreen | `features/settings/screens/` | useAuth() + useExport() |

---

## License

MIT