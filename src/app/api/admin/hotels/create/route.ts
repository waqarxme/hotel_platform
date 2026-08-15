import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { adminCreateHotelSchema } from "@/lib/schemas/hotel";
import { hashPassword } from "@/lib/auth/password";
import { toPublicUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "admin-hotels-write");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["admin"]);
    if (authError || !auth) return authError!;

    const body = await req.json();
    const result = adminCreateHotelSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid hotel details provided", 400, result.error.flatten().fieldErrors);
    }

    const data = result.data;

    // Find or create owner
    let owner = db.findUserByEmail(data.ownerEmail);
    if (!owner) {
      if (!data.ownerPassword) {
        return errorResponse(
          "VALIDATION_ERROR",
          "A password is required when provisioning a new owner account",
          400,
          { ownerPassword: ["Password required for new owner accounts"] }
        );
      }
      owner = db.createUser({
        name: data.ownerName,
        email: data.ownerEmail,
        phone: data.phone,
        role: "hotel_owner",
        passwordHash: hashPassword(data.ownerPassword),
      });
    }

    // Create hotel directly
    const newHotel = db.createHotel({
      ownerId: owner.id,
      name: data.hotelName,
      businessName: data.businessName,
      email: data.ownerEmail,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      description: data.description,
      totalRooms: data.totalRooms,
      category: data.category,
      logoUrl: data.logoUrl,
      coverImageUrl: data.coverImageUrl,
      galleryImages: [],
      amenities: data.amenities || [],
      status: data.autoApprove ? "active" : "pending_approval",
    });

    db.createNotification({
      recipientId: owner.id,
      title: "Welcome! Your Hotel is Ready",
      message: `Administrator has set up ${newHotel.name}. You can log in and start managing your rooms immediately.`,
      type: "success",
      link: "/owner/dashboard",
    });

    return successResponse({
      hotel: newHotel,
      owner: toPublicUser(owner),
      message: "Hotel created successfully and assigned to owner.",
    }, 201);
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to create hotel", 500);
  }
}
