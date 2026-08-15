import { NextRequest } from "next/server";
import { getCurrentUser, toPublicUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  const secError = guardSecurity(req, "auth-me");
  if (secError) return secError;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return successResponse({
        user: null,
        hotel: null,
        notifications: [],
      });
    }

    let hotel = null;
    if (user.role === "hotel_owner") {
      hotel = user.hotelId ? db.findHotelById(user.hotelId) : db.findHotelByOwnerId(user.id);
    }

    const notifications = db.getNotifications(user.id);

    return successResponse({
      user: toPublicUser(user),
      hotel,
      notifications,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve session", 500);
  }
}
