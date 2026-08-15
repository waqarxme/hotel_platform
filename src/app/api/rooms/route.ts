import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { roomCategorySchema } from "@/lib/schemas/room";

export async function GET(req: NextRequest) {
  const secError = guardSecurity(req, "rooms-read");
  if (secError) return secError;

  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    if (hotelId) {
      const rooms = db.getRoomsByHotelId(hotelId);
      return successResponse({ rooms });
    }

    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    const currentHotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    if (!currentHotel) {
      return errorResponse("NOT_FOUND", "No hotel found for this account", 404);
    }

    const rooms = db.getRoomsByHotelId(currentHotel.id);
    return successResponse({ rooms, hotel: currentHotel });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch room categories", 500);
  }
}

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "rooms-write");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    const currentHotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    if (!currentHotel) {
      return errorResponse("NOT_FOUND", "No hotel profile found", 404);
    }

    // Unapproved hotels cannot publish rooms
    if (currentHotel.status !== "approved" && currentHotel.status !== "active") {
      return errorResponse(
        "HOTEL_NOT_APPROVED",
        "Your hotel application is still under review. Rooms can only be added after approval.",
        403
      );
    }

    const body = await req.json();
    const result = roomCategorySchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid room data", 400, result.error.flatten().fieldErrors);
    }

    const data = result.data;
    const room = db.createRoom({
      hotelId: currentHotel.id,
      name: data.name,
      type: data.type,
      pricePerNight: data.pricePerNight,
      capacity: data.capacity,
      totalUnits: data.totalUnits,
      availableUnits: data.totalUnits,
      amenities: data.amenities || [],
      photos: data.photos || [],
      description: data.description,
      isActive: data.isActive,
    });

    return successResponse({ room, message: "Room category created successfully" }, 201);
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to create room category", 500);
  }
}

export async function PUT(req: NextRequest) {
  const secError = guardSecurity(req, "rooms-write");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return errorResponse("VALIDATION_ERROR", "Room ID is required", 400);
    }

    // IDOR Protection: Locate room and verify ownership
    const currentHotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    const existingRooms = currentHotel ? db.getRoomsByHotelId(currentHotel.id) : [];
    const isOwnerOfRoom = currentHotel && existingRooms.some((r) => r.id === id);
    const isAdmin = auth.user.role === "admin";

    if (!isAdmin && !isOwnerOfRoom) {
      return errorResponse("NOT_FOUND", "Room not found or you lack permission", 404);
    }

    const updated = db.updateRoom(id, updates);
    if (!updated) {
      return errorResponse("NOT_FOUND", "Room not found", 404);
    }

    return successResponse({ room: updated, message: "Room updated successfully" });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to update room", 500);
  }
}

export async function DELETE(req: NextRequest) {
  const secError = guardSecurity(req, "rooms-write");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("VALIDATION_ERROR", "Room ID is required", 400);
    }

    // IDOR Protection: Locate room and verify ownership
    const currentHotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    const existingRooms = currentHotel ? db.getRoomsByHotelId(currentHotel.id) : [];
    const isOwnerOfRoom = currentHotel && existingRooms.some((r) => r.id === id);
    const isAdmin = auth.user.role === "admin";

    if (!isAdmin && !isOwnerOfRoom) {
      return errorResponse("NOT_FOUND", "Room not found or you lack permission", 404);
    }

    const deleted = db.deleteRoom(id);
    if (!deleted) {
      return errorResponse("NOT_FOUND", "Room not found", 404);
    }

    return successResponse({ message: "Room removed successfully" });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to remove room", 500);
  }
}
