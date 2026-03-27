// ============================================================
// QuickCheck — WatermelonDB Models
// ============================================================
// Model classes for all database tables. These provide the
// ORM layer for local database operations.
// ============================================================

import { Model } from "@nozbe/watermelondb";
import { field, text, date, readonly, relation, children, json, writer } from "@nozbe/watermelondb/decorators";

// ─── Local Model ──────────────────────────────────────────

export class LocalModel extends Model {
  static table = "locals";

  static associations = {
    users: { type: "has_many" as const, foreignKey: "local_id" },
    members: { type: "has_many" as const, foreignKey: "local_id" },
    ministry_groups: { type: "has_many" as const, foreignKey: "local_id" },
    events: { type: "has_many" as const, foreignKey: "local_id" },
    event_templates: { type: "has_many" as const, foreignKey: "local_id" },
  };

  @text("name") name!: string;
  @text("location") location!: string | null;
  @readonly @date("created_at") createdAt!: Date;

  @children("members") members: any;
  @children("ministry_groups") ministryGroups: any;
  @children("events") events: any;
}

// ─── User Model ───────────────────────────────────────────

export class UserModel extends Model {
  static table = "users";

  static associations = {
    locals: { type: "belongs_to" as const, key: "local_id" },
  };

  @text("email") email!: string;
  @text("full_name") fullName!: string | null;
  @text("role") role!: string;
  @text("local_id") localId!: string | null;
  @text("push_token") pushToken!: string | null;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @relation("locals", "local_id") local: any;
}

// ─── Ministry Group Model ─────────────────────────────────

export class MinistryGroupModel extends Model {
  static table = "ministry_groups";

  static associations = {
    locals: { type: "belongs_to" as const, key: "local_id" },
    members: { type: "has_many" as const, foreignKey: "ministry_group_id" },
    events: { type: "has_many" as const, foreignKey: "ministry_group_id" },
  };

  @text("local_id") localId!: string;
  @text("name") name!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @relation("locals", "local_id") local: any;
  @children("members") members: any;
}

// ─── Member Model ─────────────────────────────────────────

export class MemberModel extends Model {
  static table = "members";

  static associations = {
    locals: { type: "belongs_to" as const, key: "local_id" },
    ministry_groups: { type: "belongs_to" as const, key: "ministry_group_id" },
    attendance_records: { type: "has_many" as const, foreignKey: "member_id" },
    attendance_summary: { type: "has_many" as const, foreignKey: "member_id" },
  };

  @text("local_id") localId!: string;
  @text("full_name") fullName!: string;
  @text("photo_url") photoUrl!: string | null;
  @text("contact_number") contactNumber!: string | null;
  @text("role_in_church") roleInChurch!: string | null;
  @text("ministry_group_id") ministryGroupId!: string | null;
  @text("member_since") memberSince!: string | null;
  @text("birthday") birthday!: string | null;
  @text("emergency_contact") emergencyContact!: string | null;
  @text("status") status!: string;
  @text("user_id") userId!: string | null;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @relation("locals", "local_id") local: any;
  @relation("ministry_groups", "ministry_group_id") ministryGroup: any;
  @children("attendance_records") attendanceRecords: any;
  @children("attendance_summary") attendanceSummaries: any;

  /**
   * Update this member's fields.
   */
  @writer async updateMember(fields: Partial<{
    fullName: string;
    photoUrl: string | null;
    contactNumber: string | null;
    roleInChurch: string | null;
    ministryGroupId: string | null;
    memberSince: string | null;
    birthday: string | null;
    emergencyContact: string | null;
    status: string;
  }>) {
    await this.update((member) => {
      if (fields.fullName !== undefined) member.fullName = fields.fullName;
      if (fields.photoUrl !== undefined) member.photoUrl = fields.photoUrl;
      if (fields.contactNumber !== undefined) member.contactNumber = fields.contactNumber;
      if (fields.roleInChurch !== undefined) member.roleInChurch = fields.roleInChurch;
      if (fields.ministryGroupId !== undefined) member.ministryGroupId = fields.ministryGroupId;
      if (fields.memberSince !== undefined) member.memberSince = fields.memberSince;
      if (fields.birthday !== undefined) member.birthday = fields.birthday;
      if (fields.emergencyContact !== undefined) member.emergencyContact = fields.emergencyContact;
      if (fields.status !== undefined) member.status = fields.status;
    });
  }
}

// ─── Event Template Model ─────────────────────────────────

export class EventTemplateModel extends Model {
  static table = "event_templates";

  static associations = {
    locals: { type: "belongs_to" as const, key: "local_id" },
  };

  @text("local_id") localId!: string;
  @text("name") name!: string;
  @text("event_type") eventType!: string;
  @text("default_time") defaultTime!: string | null;
  @text("default_location") defaultLocation!: string | null;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @relation("locals", "local_id") local: any;
}

// ─── Event Model ──────────────────────────────────────────

export class EventModel extends Model {
  static table = "events";

  static associations = {
    locals: { type: "belongs_to" as const, key: "local_id" },
    ministry_groups: { type: "belongs_to" as const, key: "ministry_group_id" },
    event_templates: { type: "belongs_to" as const, key: "template_id" },
    attendance_records: { type: "has_many" as const, foreignKey: "event_id" },
  };

  @text("local_id") localId!: string;
  @text("name") name!: string;
  @text("event_type") eventType!: string;
  @text("date") date!: string;
  @text("time") time!: string | null;
  @text("location") location!: string | null;
  @text("ministry_group_id") ministryGroupId!: string | null;
  @field("is_recurring") isRecurring!: boolean;
  @text("recurrence_rule") recurrenceRule!: string | null;
  @text("template_id") templateId!: string | null;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @relation("locals", "local_id") local: any;
  @relation("ministry_groups", "ministry_group_id") ministryGroup: any;
  @relation("event_templates", "template_id") template: any;
  @children("attendance_records") attendanceRecords: any;
}

// ─── Attendance Record Model ──────────────────────────────

export class AttendanceRecordModel extends Model {
  static table = "attendance_records";

  static associations = {
    events: { type: "belongs_to" as const, key: "event_id" },
    members: { type: "belongs_to" as const, key: "member_id" },
  };

  @text("event_id") eventId!: string;
  @text("member_id") memberId!: string;
  @text("status") status!: string;
  @field("minutes_late") minutesLate!: number | null;
  @text("marked_by") markedBy!: string | null;
  @date("marked_at") markedAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @relation("events", "event_id") event: any;
  @relation("members", "member_id") member: any;

  /**
   * Quick mark: update attendance status with optimistic UI.
   */
  @writer async markAttendance(
    status: "present" | "late" | "absent",
    minutesLate?: number
  ) {
    await this.update((record) => {
      record.status = status;
      record.minutesLate = status === "late" ? (minutesLate ?? null) : null;
    });
  }
}

// ─── Absence Report Model ─────────────────────────────────

export class AbsenceReportModel extends Model {
  static table = "absence_reports";

  static associations = {
    attendance_records: { type: "belongs_to" as const, key: "attendance_record_id" },
  };

  @text("attendance_record_id") attendanceRecordId!: string;
  @text("submitted_by") submittedBy!: string;
  @text("reason_category") reasonCategory!: string;
  @text("reason_text") reasonText!: string | null;
  @text("proof_url") proofUrl!: string | null;
  @text("status") status!: string;
  @text("secretary_note") secretaryNote!: string | null;
  @text("reviewed_by") reviewedBy!: string | null;
  @date("reviewed_at") reviewedAt!: Date | null;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @relation("attendance_records", "attendance_record_id") attendanceRecord: any;

  /**
   * Review an absence report (secretary action).
   */
  @writer async review(
    status: "excused" | "unexcused",
    reviewerId: string,
    secretaryNote?: string
  ) {
    await this.update((report) => {
      report.status = status;
      report.reviewedBy = reviewerId;
      report.reviewedAt = new Date();
      if (secretaryNote !== undefined) {
        report.secretaryNote = secretaryNote;
      }
    });
  }
}

// ─── Attendance Summary Model ─────────────────────────────

export class AttendanceSummaryModel extends Model {
  static table = "attendance_summary";

  static associations = {
    members: { type: "belongs_to" as const, key: "member_id" },
  };

  @text("member_id") memberId!: string;
  @text("month") month!: string;
  @field("total_events") totalEvents!: number;
  @field("present_count") presentCount!: number;
  @field("late_count") lateCount!: number;
  @field("absent_count") absentCount!: number;
  @field("excused_count") excusedCount!: number;
  @field("attendance_rate") attendanceRate!: number;
  @readonly @date("updated_at") updatedAt!: Date;

  @relation("members", "member_id") member: any;
}
