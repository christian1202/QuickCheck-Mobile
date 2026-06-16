# QuickCheck Mobile — Feature List

> Generated from the complete QuickCheck Mobile codebase analysis.
> June 16, 2026

---

## 1. Authentication & User Management

| Feature | Description |
|---|---|
| Login / Authentication | Supabase Auth (email/password) |
| Role-Based Access Control | Admin, Secretary, Member, Viewer |
| User Profiles | Photo, email, full name, local branch assignment |
| Logout | Session termination |

## 2. Dashboard (Secretary Home)

| Feature | Description |
|---|---|
| Personalized Greeting | Time-based (Good morning/afternoon/evening) with user name |
| Today's Main Event Card | Hero card with event name, time, location, and "Start Attendance" shortcut |
| Active Members Stat | Total active members count with monthly trend (+/-) |
| Monthly Attendance Average | Percentage with progress bar |
| Attendance Trend Chart | 6-month bar chart visualization |
| Status Distribution | Donut chart (Present / Late / Absent) |
| Ministry Group Breakdown | Attendance rate per group with progress bars |
| At-Risk Members List | Members with low attendance + reason, color-coded |
| Birthdays This Week | Avatar stack with count overflow |
| Upcoming Schedule | Next events with date badges, time, and location |
| Export Data Quick Action | One-tap export button |
| Search Shortcut | Quick access to search |
| Notification Icon | Badge for unread notifications |
| Offline Indicator | Wi-Fi off icon when disconnected |

## 3. Member Management

| Feature | Description |
|---|---|
| Member List | Full directory with search and filter |
| Add Member | Form: name, photo, contact, role, ministry group, member since, birthday, emergency contact, status |
| Edit Member | Modify any member detail |
| Member Statuses | Active, Inactive, On Leave, Transferred |
| Ministry Group Assignment | Youth, Worship Team, Media & Tech, Community Outreach, Ushers, Choir, Elders |
| Filtering | By status and ministry group |
| Search | By member name |
| Attendance Rate Display | Color-coded per member (green ≥70%, red <70%) |
| Avatar / Profile Photo | Image support per member |

## 4. Event Management

| Feature | Description |
|---|---|
| Events List | All events with date, time, location, expected count |
| Create Event | Name, type, date, time, location, ministry group, recurring settings |
| Event Types | Sunday Service, Prayer Meeting, Special Event, General Assembly, Other |
| Recurring Events | Recurrence rules (e.g., weekly by day) |
| Event Templates | Reusable templates with default time/location |
| Calendar View | Month/week navigation, event type filtering |
| Event Details | Expected attendance count, ministry group assignment |

## 5. Attendance Tracking (Quick Mark)

| Feature | Description |
|---|---|
| Quick Mark Screen | Per-event attendance marking interface |
| Per-Member Status Toggle | Present, Late, Absent (tap to toggle) |
| Mark All Present | Bulk mark all members present in one tap |
| Real-Time Counters | Present, Late, Absent, Unmarked summary counts |
| Search Members | Filter member list during marking |
| Attendance Rate Indicator | Color-coded bar per member |
| Finish Session | Complete and save attendance |
| Offline Mode | Works without internet, syncs later |

## 6. Reports

| Feature | Description |
|---|---|
| Reports Hub | Overview of available report types |
| Member Report | Individual member attendance history |
| Absence Report | Detailed absence records with reason categories |
| Reason Categories | Health, Work, Family, Travel, No Response, Other |
| Absence Statuses | Excused, Unexcused, No Response, Under Review |
| Proof Upload | Attach evidence to absence reports |
| Secretary Notes | Notes field on absence reports |
| Review Workflow | Reviewed by / reviewed at tracking |

## 7. Data Export & Import

| Feature | Description |
|---|---|
| Export CSV | Export attendance/member data |
| Import CSV | Bulk member import |
| Report Generation | Edge function for server-side report export |

## 8. Settings & Configuration

| Feature | Description |
|---|---|
| Dark / Light Mode | Toggle with persistent theme |
| Pre-Event Reminders | Enable/disable notifications |
| Reminder Timing | Select reminder lead time |
| Absence Report Updates | Enable/disable notifications |
| At-Risk Threshold | Configurable percentage slider (0–100%) |
| Consecutive Absence Alert | Configurable count for alerting |
| Secretary Profile | Display name, email, branch |
| App Version | Version and build info |

## 9. Notifications

| Feature | Description |
|---|---|
| Push Notifications | Via Supabase Edge Function |
| Pre-Event Reminders | Before scheduled events |
| Absence Report Updates | When absence status changes |
| Notification Badge | Unread count indicator |

## 10. Offline-First Architecture

| Feature | Description |
|---|---|
| Local Database | WatermelonDB for full offline support |
| Delta Sync | Bi-directional sync with Supabase |
| Auto-Sync on Reconnect | Triggers when network comes back online |
| Periodic Background Sync | Every 5 minutes |
| Offline Mode Indicator | Visual feedback in header |
| Conflict Resolution | Server wins (Supabase as source of truth) |
| Offline CRUD | All operations work offline |

## 11. Multi-Branch (Local) Support

| Feature | Description |
|---|---|
| Local/Branch Context | Each user belongs to a Local (church branch) |
| Data Scoping | All data filtered by local_id |
| Branch Identifier | Branch name displayed in headers |

## 12. Advanced Features

| Feature | Description |
|---|---|
| At-Risk Member Detection | Low attendance rate + consecutive absence flags |
| Monthly Attendance Summaries | Aggregated per-member stats (present/late/absent/excused counts + rate) |
| 6-Month Attendance Trend | Bar chart visualization |
| Birthday Tracking | This week's birthdays + next upcoming |
| Recurring Event Rules | Weekly/monthly recurrence support |
| Event Templates | Faster event creation from presets |
| Ministry Group Analytics | Attendance rates per group |
| Status Distribution Visualization | Donut chart |
| Glassmorphism UI | Modern translucent tab bar styling |
| Role-Based Navigation | Different views per user role |

---

## Screen Inventory (13 Screens)

| # | Screen | File |
|---|---|---|
| 1 | Splash | `src/screens/SplashScreen.tsx` |
| 2 | Login | `src/screens/LoginScreen.tsx` |
| 3 | Dashboard | `src/screens/DashboardScreen.tsx` |
| 4 | Member List | `src/screens/MemberListScreen.tsx` |
| 5 | Add/Edit Member | `src/screens/AddEditMemberScreen.tsx` |
| 6 | Events | `src/screens/EventsScreen.tsx` |
| 7 | Create Event | `src/screens/CreateEventScreen.tsx` |
| 8 | Calendar | `src/screens/CalendarScreen.tsx` |
| 9 | Quick Mark | `src/screens/QuickMarkScreen.tsx` |
| 10 | Reports | `src/screens/ReportsScreen.tsx` |
| 11 | Member Report | `src/screens/MemberReportScreen.tsx` |
| 12 | Absence Report | `src/screens/AbsenceReportScreen.tsx` |
| 13 | Settings | `src/screens/SettingsScreen.tsx` |

## Edge Functions (5 Functions)

| # | Function | Purpose |
|---|---|---|
| 1 | `sync` | Delta data synchronization |
| 2 | `export-report` | Server-side report generation |
| 3 | `import-members` | Bulk member import handler |
| 4 | `send-notification` | Push notification delivery |
| 5 | `upload-proof` | Absence proof file upload |

## Database Tables (9 Tables)

| # | Table | Purpose |
|---|---|---|
| 1 | `locals` | Church branches |
| 2 | `users` | User accounts |
| 3 | `members` | Church members |
| 4 | `ministry_groups` | Ministry group definitions |
| 5 | `events` | Scheduled events |
| 6 | `event_templates` | Reusable event presets |
| 7 | `attendance_records` | Per-event attendance marks |
| 8 | `absence_reports` | Filed absence reasons/proof |
| 9 | `attendance_summary` | Monthly aggregated stats |