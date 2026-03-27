// ============================================================
// QuickCheck — Send Notification Edge Function
// ============================================================
// Push notification sender using Expo Push Notification API.
// Called by database webhooks or cron jobs.
//
// POST /send-notification
// Body: {
//   type: 'event_reminder' | 'absence_marked' | 'report_reviewed' | 'escalation',
//   targetMemberIds: string[],
//   eventId?: string,
//   data?: Record<string, string>
// }
// Returns: { sent: number, failed: number }
// ============================================================

import { serve } from "@std/http/server";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { requireAuth, requireRole, createServiceClient } from "../_shared/auth.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type NotificationType =
  | "event_reminder"
  | "absence_marked"
  | "report_reviewed"
  | "escalation";

interface NotificationRequest {
  type: NotificationType;
  targetMemberIds: string[];
  eventId?: string;
  data?: Record<string, string>;
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Require secretary+ role
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;

  const roleError = requireRole(user, "admin", "secretary");
  if (roleError) return roleError;

  try {
    const body: NotificationRequest = await req.json();
    const { type, targetMemberIds, eventId, data } = body;

    if (!type || !targetMemberIds?.length) {
      return new Response(
        JSON.stringify({ error: "type and targetMemberIds are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service client to bypass RLS for push token lookup
    const serviceClient = createServiceClient();

    // Get push tokens for the target members
    // Members are linked to users via members.user_id → users.id
    const { data: members } = await serviceClient
      .from("members")
      .select("id, full_name, user_id")
      .in("id", targetMemberIds);

    if (!members?.length) {
      return new Response(
        JSON.stringify({ sent: 0, failed: 0, message: "No matching members found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user IDs that have accounts
    const userIds = members
      .filter((m: any) => m.user_id)
      .map((m: any) => m.user_id);

    if (!userIds.length) {
      return new Response(
        JSON.stringify({ sent: 0, failed: 0, message: "No members have linked app accounts" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get push tokens
    const { data: users } = await serviceClient
      .from("users")
      .select("id, push_token, full_name")
      .in("id", userIds)
      .not("push_token", "is", null);

    if (!users?.length) {
      return new Response(
        JSON.stringify({ sent: 0, failed: 0, message: "No push tokens registered" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build notification messages
    let eventName = "";
    if (eventId) {
      const { data: event } = await serviceClient
        .from("events")
        .select("name, date, time")
        .eq("id", eventId)
        .single();
      if (event) eventName = event.name;
    }

    const messages = users.map((u: any) => ({
      to: u.push_token,
      sound: "default",
      ...getNotificationContent(type, eventName, data),
      data: {
        type,
        eventId: eventId || null,
        ...data,
      },
    }));

    // Send via Expo Push API (batch of 100 max)
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);

      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(batch),
      });

      if (response.ok) {
        const result = await response.json();
        for (const ticket of result.data || []) {
          if (ticket.status === "ok") {
            sent++;
          } else {
            failed++;
            console.error("Push ticket error:", ticket);
          }
        }
      } else {
        failed += batch.length;
        console.error("Expo push API error:", await response.text());
      }
    }

    return new Response(
      JSON.stringify({ sent, failed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Notification error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send notifications" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Notification Content Templates ───────────────────────

function getNotificationContent(
  type: NotificationType,
  eventName: string,
  data?: Record<string, string>
) {
  switch (type) {
    case "event_reminder":
      return {
        title: "📅 Upcoming Event",
        body: eventName
          ? `${eventName} is starting soon. See you there!`
          : "You have an upcoming event. Don't forget to attend!",
      };

    case "absence_marked":
      return {
        title: "📋 Attendance Update",
        body: eventName
          ? `You were marked absent for ${eventName}. If this is a mistake, contact your secretary.`
          : "You were marked absent for a recent event.",
      };

    case "report_reviewed":
      const status = data?.status || "reviewed";
      return {
        title: status === "excused" ? "✅ Absence Excused" : "📝 Absence Report Updated",
        body: status === "excused"
          ? "Your absence report has been approved and marked as excused."
          : `Your absence report status has been updated to: ${status}`,
      };

    case "escalation":
      const count = data?.consecutiveAbsences || "multiple";
      return {
        title: "⚠️ Attendance Alert",
        body: `You have ${count} consecutive absences. Please reach out to your church secretary.`,
      };

    default:
      return {
        title: "QuickCheck",
        body: "You have a new notification.",
      };
  }
}
