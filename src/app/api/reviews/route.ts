import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyAuth, errorResponse, successResponse, guardSecurity, toPublicReview } from "@/lib/auth/rbac";
import { createReviewSchema, respondReviewSchema } from "@/lib/schemas/review";

export async function GET(req: NextRequest) {
  const secError = guardSecurity(req, "reviews-read");
  if (secError) return secError;

  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    if (hotelId) {
      // Prevent enumeration of reviews from non-public hotels
      const hotel = db.findHotelById(hotelId);
      const currentUser = await getCurrentUser();
      const isOwner = currentUser && (currentUser.id === hotel?.ownerId || currentUser.hotelId === hotelId);
      const isAdmin = currentUser?.role === "admin";

      if (
        !isAdmin &&
        !isOwner &&
        hotel &&
        hotel.status !== "active" &&
        hotel.status !== "approved"
      ) {
        return errorResponse("NOT_FOUND", "Hotel not found or unavailable", 404);
      }

      const reviews = db.getReviewsByHotelId(hotelId);
      return successResponse({ reviews: reviews.map(toPublicReview) });
    }

    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    const currentHotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    if (!currentHotel) {
      return errorResponse("NOT_FOUND", "No hotel found", 404);
    }

    const reviews = db.getReviewsByHotelId(currentHotel.id);
    return successResponse({ reviews, hotel: currentHotel });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve reviews", 500);
  }
}

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "reviews-create", { capacity: 10, refillRatePerSec: 0.2 });
  if (secError) return secError;

  try {
    const body = await req.json();
    const result = createReviewSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid review submission", 400, result.error.flatten().fieldErrors);
    }

    const review = db.createReview(result.data);

    return successResponse({
      review,
      message: "Thank you! Your review has been submitted.",
    }, 201);
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to create review", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const secError = guardSecurity(req, "reviews-respond");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["hotel_owner", "admin"]);
    if (authError || !auth) return authError!;

    const body = await req.json();
    const result = respondReviewSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "A valid response is required", 400, result.error.flatten().fieldErrors);
    }

    // IDOR Protection: Locate review and verify hotel ownership
    const currentHotel = auth.hotel ?? db.findHotelByOwnerId(auth.user.id);
    const existingReviews = currentHotel ? db.getReviewsByHotelId(currentHotel.id) : [];
    const isOwnerOfReview = existingReviews.some((r) => r.id === result.data.reviewId);
    const isAdmin = auth.user.role === "admin";

    if (!isAdmin && !isOwnerOfReview) {
      return errorResponse("NOT_FOUND", "Review not found or you lack permission", 404);
    }

    const updated = db.respondToReview(result.data.reviewId, result.data.response);
    if (!updated) {
      return errorResponse("NOT_FOUND", "Review not found", 404);
    }

    return successResponse({
      review: updated,
      message: "Response published to guest review.",
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to publish response", 500);
  }
}
