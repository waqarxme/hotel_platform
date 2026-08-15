import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse } from "@/lib/auth/rbac";
import { suspendHotelSchema } from "@/lib/schemas/hotel";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, errorResponse: authError } = await verifyAuth(["admin"]);
    if (authError || !auth) return authError!;

    const body = await req.json();
    const result = suspendHotelSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Suspension reason is required", 400, result.error.flatten().fieldErrors);
    }

    const hotel = db.findHotelById(params.id);
    if (!hotel) {
      return errorResponse("NOT_FOUND", "Hotel not found", 404);
    }

    const updatedHotel = db.suspendHotel(params.id, result.data.reason);

    return successResponse({
      hotel: updatedHotel,
      message: `${hotel.name} has been suspended.`,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to suspend hotel", 500);
  }
}
