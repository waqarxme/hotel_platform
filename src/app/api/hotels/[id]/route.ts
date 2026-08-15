import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyAuth, errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { updateHotelProfileSchema } from "@/lib/schemas/hotel";
import { z } from "zod";

const adminUpdateSchema = updateHotelProfileSchema.extend({
  isVerified: z.boolean().optional(),
  status: z.enum(["draft", "pending_approval", "approved", "active", "rejected", "suspended"]).optional(),
  adminNotes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const secError = guardSecurity(req, "hotel-detail-read");
  if (secError) return secError;

  try {
    const hotel = db.findHotelById(params.id);
    if (!hotel) {
      return errorResponse("NOT_FOUND", "Hotel not found", 404);
    }

    const currentUser = await getCurrentUser();
    const isOwner = currentUser && (currentUser.id === hotel.ownerId || currentUser.hotelId === hotel.id);
    const isAdmin = currentUser && currentUser.role === "admin";

    // Public users can only see approved or active hotels. Return 404 to prevent enumeration.
    if (!isAdmin && !isOwner && hotel.status !== "active" && hotel.status !== "approved") {
      return errorResponse("NOT_FOUND", "Hotel not found or currently unavailable", 404);
    }

    const rooms = db.getRoomsByHotelId(hotel.id);
    const reviews = db.getReviewsByHotelId(hotel.id);
    const bookings = db.getBookingsByHotelId(hotel.id);

    return successResponse({
      hotel,
      rooms,
      reviews,
      stats: {
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.status !== "cancelled" ? b.totalPrice : 0), 0),
      },
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to load hotel details", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const secError = guardSecurity(req, "admin-hotel-edit");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["admin", "hotel_owner"]);
    if (authError || !auth) return authError!;

    const hotel = db.findHotelById(params.id);
    if (!hotel) {
      return errorResponse("NOT_FOUND", "Hotel not found", 404);
    }

    const isOwner = hotel.ownerId === auth.user.id || auth.user.hotelId === hotel.id;
    const isAdmin = auth.user.role === "admin";

    // Return 404 instead of 403 to prevent enumeration attacks (Rule B-10)
    if (!isAdmin && !isOwner) {
      return errorResponse("NOT_FOUND", "Hotel not found or you lack permission", 404);
    }

    const body = await req.json();
    const result = adminUpdateSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid update data", 400, result.error.flatten().fieldErrors);
    }

    const updatePayload = { ...result.data };

    // Privilege Separation: Only admin can modify verification status, approval state, and admin notes
    if (!isAdmin) {
      delete updatePayload.isVerified;
      delete updatePayload.status;
      delete updatePayload.adminNotes;
    }

    const updated = db.updateHotel(params.id, updatePayload);

    return successResponse({
      hotel: updated,
      message: "Hotel information updated successfully.",
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to update hotel information", 500);
  }
}
