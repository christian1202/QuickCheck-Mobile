# Data Sync & Backup Strategy

## Architecture: Local-First with One-Way Cloud Backup

QuickCheck Mobile uses a **Local-First, Cloud-Backup** architecture to provide blazing fast, offline-capable performance without the ongoing costs of a Backend-as-a-Service (like Supabase or Firebase).

### 1. The Core (Local Storage)
The app uses **WatermelonDB** (SQLite) as its primary database.
- **Why?** It ensures the app has 0 loading spinners, works 100% offline (crucial for areas with bad Wi-Fi), and costs absolutely nothing in hosting fees.

### 2. The Backup (One-Way Sync to Google Sheets)
Instead of a traditional cloud database, the app uses **Google Sheets** as a live, human-readable backup.
- Whenever the secretary adds a member, creates an event, or marks attendance, the app writes to WatermelonDB instantly.
- In the background, `googleSheetsService.ts` executes a **One-Way Sync** (App ➔ Sheets), appending the new data to three dedicated tabs in a linked Google Spreadsheet:
  1. `Members`
  2. `Events`
  3. `Attendance`

### 3. The Disaster Recovery (Restore from Backup)
If a user loses their phone, their phone breaks, or the app is uninstalled, they will lose their local SQLite database. The app features a robust recovery workflow:

1. **Reconnect:** The user opens the fresh app, goes to Settings, and connects their Google Account.
2. **Select Backup:** They select their existing QuickCheck Google Sheet.
3. **Restore Process:** The app triggers a "Restore from Backup" protocol:
   - It downloads the `Members` tab and re-populates the local database with all personnel.
   - It downloads the `Events` tab to rebuild the calendar.
   - It downloads the `Attendance` tab and maps the attendance records back to the corresponding members and events.
4. **Trade-offs:** Text and numeric data are restored with 100% accuracy. Because Google Sheets does not efficiently store raw image files, Member Profile Pictures are discarded upon app deletion and will default to initials upon restoration.

### Why not Two-Way Sync?
Two-way sync (where users can edit the Google Sheet directly on their PC and the app pulls the changes down) introduces complex collision resolutions, race conditions, and heavy polling against Google's API rate limits. By enforcing a **One-Way Sync** (the App is the single source of truth), we guarantee data integrity while still providing a free, easily accessible backup and reporting tool.
