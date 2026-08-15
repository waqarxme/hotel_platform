import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { hotelRegistrationSchema } from "@/lib/schemas/hotel";
import { createSessionCookieValue, getCurrentUser, SESSION_COOKIE_OPTIONS, toPublicUser } from "@/lib/auth/session";
import { errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "hotel-register", { capacity: 5, refillRatePerSec: 0.1 });
  if (secError) return secError;

  try {
    const body = await req.json();
    const result = hotelRegistrationSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Please fill in all required fields accurately", 400, result.error.flatten().fieldErrors);
    }

    const data = result.data;
    const currentUser = await getCurrentUser();

    // If user is not logged in, create the owner account. If an account with
    // this email already exists, require login instead of silently adopting it.
    let owner = currentUser;
    if (!owner) {
      const existingUser = db.findUserByEmail(data.email);
      if (existingUser) {
        return errorResponse(
          "LOGIN_REQUIRED",
          "An account with this email already exists. Please sign in before registering a hotel.",
          401
        );
      }
      owner = db.createUser({
        name: data.businessName,
        email: data.email,
        phone: data.phone,
        role: "hotel_owner",
        passwordHash: hashPassword(data.ownerPassword),
      });
    }

    // Check if owner already has a pending or active hotel
    const existingHotel = db.findHotelByOwnerId(owner.id);
    if (existingHotel && existingHotel.status !== "rejected") {
      return errorResponse(
        "ALREADY_EXISTS",
        `You already have an application in status: ${existingHotel.status.replace("_", " ")}`,
        409
      );
    }

    // Create the hotel in pending_approval status
    const newHotel = db.createHotel({
      ownerId: owner.id,
      name: data.hotelName,
      businessName: data.businessName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      googleMapsUrl: data.googleMapsUrl || undefined,
      description: data.description,
      totalRooms: data.totalRooms,
      category: data.category,
      businessLicenseUrl: data.businessLicenseUrl || undefined,
      cnicUrl: data.cnicUrl || undefined,
      logoUrl: data.logoUrl || undefined,
      coverImageUrl: data.coverImageUrl || undefined,
      galleryImages: [],
      amenities: data.amenities || [],
      status: "pending_approval",
    });

    const cookieValue = createSessionCookieValue(owner);
    const response = successResponse({
      hotel: newHotel,
      user: toPublicUser(owner),
      message: "Hotel registration request submitted successfully. It is now awaiting admin review.",
    }, 201);

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: cookieValue,
    });

    return response;
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to submit hotel registration request", 500);
  }
}