import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { errorResponse, successResponse } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    }

    let hotel = null;
    if (user.role === "hotel_owner") {
      hotel = user.hotelId ? db.findHotelById(user.hotelId) : db.findHotelByOwnerId(user.id);
    }

    const notifications = db.getNotifications(user.id);

    return successResponse({
      user,
      hotel,
      notifications,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve session", 500);
  }
}
