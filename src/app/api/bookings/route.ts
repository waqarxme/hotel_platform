import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { createBookingSchema, updateBookingStatusSchema } from "@/lib/schemas/booking";

export async function GET(req: NextRequest) {
  const secError = guardSecurity(req, "bookings-read");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin", "customer"]);
    if (authError || !auth) return authError!;

    if (auth.user.role === "admin") {
      const bookings = db.getAllBookings();
      return successResponse({ bookings });
    }

    const currentHotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    if (!currentHotel) {
      return errorResponse("NOT_FOUND", "No hotel associated with this owner", 404);
    }

    const bookings = db.getBookingsByHotelId(currentHotel.id);
    return successResponse({ bookings });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve bookings", 500);
  }
}

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "bookings-create", { capacity: 15, refillRatePerSec: 0.5 });
  if (secError) return secError;

  try {
    const body = await req.json();
    const result = createBookingSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid booking details", 400, result.error.flatten().fieldErrors);
    }

    const data = result.data;
    const hotel = db.findHotelById(data.hotelId);

    if (!hotel || (hotel.status !== "active" && hotel.status !== "approved")) {
      return errorResponse("HOTEL_UNAVAILABLE", "This hotel is currently not accepting reservations", 400);
    }

    const rooms = db.getRoomsByHotelId(hotel.id);
    const room = rooms.find((r) => r.id === data.roomId);

    // Calculate nights & price
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    const diffTime = Math.max(1, Math.abs(checkOut.getTime() - checkIn.getTime()));
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const pricePerNight = room ? room.pricePerNight : 150;
    const totalPrice = nights * pricePerNight;

    const booking = db.createBooking({
      hotelId: data.hotelId,
      roomId: data.roomId,
      roomName: room?.name ?? "Standard Room",
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guestsCount: data.guestsCount,
      totalPrice,
      status: "confirmed",
    });

    return successResponse({
      booking,
      message: "Reservation confirmed successfully!",
    }, 201);
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to process booking", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const secError = guardSecurity(req, "bookings-update");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    const body = await req.json();
    const { bookingId, status } = body;

    const statusCheck = updateBookingStatusSchema.safeParse({ status });
    if (!statusCheck.success || !bookingId) {
      return errorResponse("VALIDATION_ERROR", "Valid booking ID and status are required", 400);
    }

    // IDOR Protection: Locate booking and verify ownership
    const currentHotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    const allBookings = db.getAllBookings();
    const targetBooking = allBookings.find((b) => b.id === bookingId);

    if (!targetBooking) {
      return errorResponse("NOT_FOUND", "Booking not found", 404);
    }

    const isOwnerOfBooking = currentHotel && targetBooking.hotelId === currentHotel.id;
    const isAdmin = auth.user.role === "admin";

    if (!isAdmin && !isOwnerOfBooking) {
      return errorResponse("NOT_FOUND", "Booking not found or you lack permission", 404);
    }

    const updated = db.updateBookingStatus(bookingId, status);
    if (!updated) {
      return errorResponse("NOT_FOUND", "Booking not found", 404);
    }

    return successResponse({
      booking: updated,
      message: `Booking status updated to ${status}`,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to update booking status", 500);
  }
}
