import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse } from "@/lib/auth/rbac";
import { HotelStatus } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { auth, errorResponse: authError } = await verifyAuth(["admin"]);
    if (authError || !auth) return authError!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as HotelStatus | "all" | null;
    const search = searchParams.get("search")?.toLowerCase();

    let hotels = db.getHotels();

    // Calculate count for each status queue
    const counts = {
      all: hotels.length,
      pending: hotels.filter((h) => h.status === "pending_approval").length,
      approved: hotels.filter((h) => h.status === "approved" || h.status === "active").length,
      rejected: hotels.filter((h) => h.status === "rejected").length,
      suspended: hotels.filter((h) => h.status === "suspended").length,
    };

    if (status && status !== "all") {
      if (status === "approved") {
        hotels = hotels.filter((h) => h.status === "approved" || h.status === "active");
      } else {
        hotels = hotels.filter((h) => h.status === status);
      }
    }

    if (search) {
      hotels = hotels.filter(
        (h) =>
          h.name.toLowerCase().includes(search) ||
          h.city.toLowerCase().includes(search) ||
          h.email.toLowerCase().includes(search) ||
          h.businessName.toLowerCase().includes(search)
      );
    }

    return successResponse({
      hotels,
      counts,
      total: hotels.length,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to load admin hotels", 500);
  }
}
