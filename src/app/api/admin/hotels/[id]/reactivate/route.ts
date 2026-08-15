import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse } from "@/lib/auth/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, errorResponse: authError } = await verifyAuth(["admin"]);
    if (authError || !auth) return authError!;

    const hotel = db.findHotelById(params.id);
    if (!hotel) {
      return errorResponse("NOT_FOUND", "Hotel not found", 404);
    }

    const updatedHotel = db.reactivateHotel(params.id);

    return successResponse({
      hotel: updatedHotel,
      message: `${hotel.name} has been reactivated and is now visible on the platform.`,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to reactivate hotel", 500);
  }
}
