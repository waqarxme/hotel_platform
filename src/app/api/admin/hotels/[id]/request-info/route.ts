import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { z } from "zod";

const requestInfoSchema = z.object({
  message: z.string().min(5, "Message specifying what additional information is required"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const secError = guardSecurity(req, "admin-hotels");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["admin"]);
    if (authError || !auth) return authError!;

    const body = await req.json();
    const result = requestInfoSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "A clear message describing the required information is required", 400, result.error.flatten().fieldErrors);
    }

    const hotel = db.findHotelById(params.id);
    if (!hotel) {
      return errorResponse("NOT_FOUND", "Hotel application not found", 404);
    }

    const updated = db.updateHotel(params.id, {
      adminNotes: `Information Requested: ${result.data.message}`,
    });

    db.createNotification({
      recipientId: hotel.ownerId,
      title: "Additional Information Required",
      message: `The administration requires more details for ${hotel.name}: "${result.data.message}". Please update your profile.`,
      type: "warning",
      link: "/owner/profile",
    });

    return successResponse({
      hotel: updated,
      message: `Information request dispatched to owner (${hotel.email}).`,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to send information request", 500);
  }
}
