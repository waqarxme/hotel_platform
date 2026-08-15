import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { createCleaningRequestSchema } from "@/lib/schemas/cleaning";

export async function GET(req: NextRequest) {
  const secError = guardSecurity(req, "cleaning-read");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    if (auth.user.role === "admin") {
      const requests = db.getCleaningRequests();
      const teams = db.getCleaningTeams();
      return successResponse({ requests, teams });
    }

    const currentHotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    if (!currentHotel) {
      return errorResponse("NOT_FOUND", "No hotel found", 404);
    }

    const requests = db.getCleaningRequests(currentHotel.id);
    const availableCleanings = Math.max(0, currentHotel.eligibleFreeCleanings - currentHotel.usedFreeCleanings);

    return successResponse({
      requests,
      eligibility: {
        isEligible: currentHotel.cleaningServiceEligible,
        totalEarned: currentHotel.eligibleFreeCleanings,
        used: currentHotel.usedFreeCleanings,
        available: availableCleanings,
      },
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve cleaning requests", 500);
  }
}

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "cleaning-write");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    const currentHotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    if (!currentHotel) {
      return errorResponse("NOT_FOUND", "No hotel found", 404);
    }

    const body = await req.json();
    const result = createCleaningRequestSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid cleaning request details", 400, result.error.flatten().fieldErrors);
    }

    const availableCleanings = Math.max(0, currentHotel.eligibleFreeCleanings - currentHotel.usedFreeCleanings);
    if (availableCleanings <= 0 && currentHotel.eligibleFreeCleanings === 0) {
      // Still allow request submission, mark as standard/chargeable or queue
    }

    const request = db.createCleaningRequest({
      hotelId: currentHotel.id,
      hotelName: currentHotel.name,
      roomNumbers: result.data.roomNumbers,
      requestedDate: result.data.requestedDate,
      specialInstructions: result.data.specialInstructions,
    });

    return successResponse({
      request,
      message: "Cleaning service request dispatched to administration.",
    }, 201);
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to submit cleaning request", 500);
  }
}
