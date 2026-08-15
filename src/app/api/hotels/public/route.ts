import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { successResponse, errorResponse, guardSecurity } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  const secError = guardSecurity(req, "public-hotels", { capacity: 120, refillRatePerSec: 2 });
  if (secError) return secError;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const city = searchParams.get("city")?.toLowerCase();
    const category = searchParams.get("category");

    let hotels = db.getPublicHotels();

    if (search) {
      hotels = hotels.filter(
        (h) =>
          h.name.toLowerCase().includes(search) ||
          h.city.toLowerCase().includes(search) ||
          h.description.toLowerCase().includes(search)
      );
    }

    if (city && city !== "all") {
      hotels = hotels.filter((h) => h.city.toLowerCase() === city);
    }

    if (category && category !== "all") {
      hotels = hotels.filter((h) => h.category === category);
    }

    const hotelsWithPrice = hotels.map((h) => {
      const rooms = db.getRoomsByHotelId(h.id);
      const minPrice = rooms.length > 0 ? Math.min(...rooms.map((r) => r.pricePerNight)) : 120;
      return {
        ...h,
        startingPrice: minPrice,
        roomsCount: rooms.length,
      };
    });

    return successResponse(
      {
        hotels: hotelsWithPrice,
        total: hotelsWithPrice.length,
      },
      200,
      {
        cacheControl: "public, s-maxage=60, stale-while-revalidate=120",
        setCsrf: true,
      }
    );
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch public hotels", 500);
  }
}
