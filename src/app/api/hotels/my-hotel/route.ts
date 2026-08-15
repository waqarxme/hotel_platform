import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse } from "@/lib/auth/rbac";
import { updateHotelProfileSchema } from "@/lib/schemas/hotel";

export async function GET() {
  try {
    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    const hotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    if (!hotel) {
      return errorResponse("NOT_FOUND", "No hotel found for this account", 404);
    }

    const rooms = db.getRoomsByHotelId(hotel.id);
    const bookings = db.getBookingsByHotelId(hotel.id);
    const reviews = db.getReviewsByHotelId(hotel.id);

    return successResponse({
      hotel,
      roomsCount: rooms.length,
      bookingsCount: bookings.length,
      reviewsCount: reviews.length,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve hotel", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    const hotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    if (!hotel) {
      return errorResponse("NOT_FOUND", "No hotel found to update", 404);
    }

    const body = await req.json();
    const result = updateHotelProfileSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid update data", 400, result.error.flatten().fieldErrors);
    }

    // If hotel was rejected and owner updates it, transition status back to pending_approval
    const updates = { ...result.data };
    let newStatus = hotel.status;
    if (hotel.status === "rejected") {
      newStatus = "pending_approval";
    }

    const updatedHotel = db.updateHotel(hotel.id, {
      ...updates,
      status: newStatus,
      rejectionReason: newStatus === "pending_approval" ? undefined : hotel.rejectionReason,
    });

    if (newStatus === "pending_approval" && hotel.status === "rejected") {
      db.createNotification({
        recipientId: "usr-admin-1",
        title: "Resubmitted Hotel Registration",
        message: `${hotel.name} has updated their details and resubmitted for approval.`,
        type: "info",
        link: `/admin/hotels/${hotel.id}`,
      });
    }

    return successResponse({
      hotel: updatedHotel,
      message: "Hotel profile updated successfully",
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to update hotel profile", 500);
  }
}
