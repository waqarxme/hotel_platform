import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse } from "@/lib/auth/rbac";
import { approveHotelSchema } from "@/lib/schemas/hotel";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, errorResponse: authError } = await verifyAuth(["admin"]);
    if (authError || !auth) return authError!;

    const body = await req.json().catch(() => ({}));
    const result = approveHotelSchema.safeParse(body);
    const adminNotes = result.success ? result.data.adminNotes : undefined;

    const hotel = db.findHotelById(params.id);
    if (!hotel) {
      return errorResponse("NOT_FOUND", "Hotel not found", 404);
    }

    const updatedHotel = db.approveHotel(params.id, adminNotes);

    return successResponse({
      hotel: updatedHotel,
      message: `${hotel.name} has been approved successfully. Full dashboard unlocked for the owner.`,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to approve hotel", 500);
  }
}
