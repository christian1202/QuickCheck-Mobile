// ============================================================
// QuickCheck — WatermelonDB Database Initialization
// ============================================================
// Sets up the local SQLite database with WatermelonDB.
// This is the offline-first data layer that syncs with Supabase.
// ============================================================

import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import {
  LocalModel,
  UserModel,
  MinistryGroupModel,
  MemberModel,
  EventTemplateModel,
  EventModel,
  AttendanceRecordModel,
  AbsenceReportModel,
  AttendanceSummaryModel,
} from "./models";

// ─── SQLite Adapter ──────────────────────────────────────

const adapter = new SQLiteAdapter({
  schema,
  // Enable WAL mode for better write performance on Android
  jsi: true, // Enable JSI for faster native calls
  onSetUpError: (error) => {
    console.error("WatermelonDB setup error:", error);
    // In production, you might want to delete the DB and re-sync
  },
});

// ─── Database Instance ───────────────────────────────────

export const database = new Database({
  adapter,
  modelClasses: [
    LocalModel,
    UserModel,
    MinistryGroupModel,
    MemberModel,
    EventTemplateModel,
    EventModel,
    AttendanceRecordModel,
    AbsenceReportModel,
    AttendanceSummaryModel,
  ],
});

// ─── Collection Accessors ────────────────────────────────
// Convenience accessors for use throughout the app.

export const localsCollection = database.get<LocalModel>("locals");
export const usersCollection = database.get<UserModel>("users");
export const ministryGroupsCollection = database.get<MinistryGroupModel>("ministry_groups");
export const membersCollection = database.get<MemberModel>("members");
export const eventTemplatesCollection = database.get<EventTemplateModel>("event_templates");
export const eventsCollection = database.get<EventModel>("events");
export const attendanceRecordsCollection = database.get<AttendanceRecordModel>("attendance_records");
export const absenceReportsCollection = database.get<AbsenceReportModel>("absence_reports");
export const attendanceSummaryCollection = database.get<AttendanceSummaryModel>("attendance_summary");

export default database;
