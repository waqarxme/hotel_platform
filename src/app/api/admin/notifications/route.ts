import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse } from "@/lib/auth/rbac";
import { createNotificationSchema } from "@/lib/schemas/review";

export async function POST(req: NextRequest) {
  try {
    const { auth, errorResponse: authError } = await verifyAuth(["admin"]);
    if (authError || !auth) return authError!;

    const body = await req.json();
    const result = createNotificationSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid notification data", 400, result.error.flatten().fieldErrors);
    }

    const notification = db.createNotification(result.data);

    return successResponse({
      notification,
      message: "Notification broadcast sent successfully",
    }, 201);
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to dispatch notification", 500);
  }
}
