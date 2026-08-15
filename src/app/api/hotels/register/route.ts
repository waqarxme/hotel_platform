import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { hotelRegistrationSchema } from "@/lib/schemas/hotel";
import { createSessionCookieValue, getCurrentUser, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session";
import { errorResponse, successResponse } from "@/lib/auth/rbac";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = hotelRegistrationSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Please fill in all required fields accurately", 400, result.error.flatten().fieldErrors);
    }

    const data = result.data;
    let currentUser = await getCurrentUser();

    // If user is not logged in, create or find the owner account
    if (!currentUser) {
      const existingUser = db.findUserByEmail(data.email);
      if (existingUser) {
        currentUser = existingUser;
      } else {
        currentUser = db.createUser({
          name: data.businessName,
          email: data.email,
          phone: data.phone,
          role: "hotel_owner",
        });
      }
    }

    // Check if owner already has a pending or active hotel
    const existingHotel = db.findHotelByOwnerId(currentUser.id);
    if (existingHotel && existingHotel.status !== "rejected") {
      return errorResponse(
        "ALREADY_EXISTS",
        `You already have an application in status: ${existingHotel.status.replace("_", " ")}`,
        409
      );
    }

    // Create the hotel in pending_approval status
    const newHotel = db.createHotel({
      ownerId: currentUser.id,
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

    const cookieValue = createSessionCookieValue(currentUser);
    const response = successResponse({
      hotel: newHotel,
      user: currentUser,
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
