import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { z } from "zod";

const markReadSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const secError = guardSecurity(req, "notifications");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth();
    if (authError || !auth) return authError!;

    const notifications = db.getNotifications(auth.user.id);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return successResponse({
      notifications,
      unreadCount,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to load notifications", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const secError = guardSecurity(req, "notifications-update");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth();
    if (authError || !auth) return authError!;

    const body = await req.json();
    const result = markReadSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid notification update request", 400);
    }

    const userNotifs = db.getNotifications(auth.user.id);

    if (result.data.notificationId) {
      // IDOR Protection: Verify notification belongs to the authenticated user
      const targetNotif = userNotifs.find((n) => n.id === result.data.notificationId);
      if (!targetNotif) {
        return errorResponse("NOT_FOUND", "Notification not found or access denied", 404);
      }
      db.markNotificationRead(result.data.notificationId);
    } else if (result.data.markAll) {
      for (const n of userNotifs) {
        db.markNotificationRead(n.id);
      }
    }

    return successResponse({ success: true, message: "Notifications updated." });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to update notification state", 500);
  }
}
