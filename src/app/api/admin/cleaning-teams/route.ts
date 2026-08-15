import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { verifyAuth, errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { assignCleaningTeamSchema, createCleaningTeamSchema } from "@/lib/schemas/cleaning";

export async function GET(req: NextRequest) {
  const secError = guardSecurity(req, "admin-cleaning-read");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["admin"]);
    if (authError || !auth) return authError!;

    const teams = db.getCleaningTeams();
    const requests = db.getCleaningRequests();

    return successResponse({
      teams,
      requests,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to load cleaning teams", 500);
  }
}

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "admin-cleaning-write");
  if (secError) return secError;

  try {
    const { auth, errorResponse: authError } = await verifyAuth(["admin"]);
    if (authError || !auth) return authError!;

    const body = await req.json();

    // Check if assigning team to request or creating a new team
    if ("cleaningRequestId" in body) {
      const result = assignCleaningTeamSchema.safeParse(body);
      if (!result.success) {
        return errorResponse("VALIDATION_ERROR", "Invalid assignment details", 400, result.error.flatten().fieldErrors);
      }

      const assigned = db.assignCleaningTeam(result.data.cleaningRequestId, result.data.teamId);
      if (!assigned) {
        return errorResponse("NOT_FOUND", "Request or Team not found", 404);
      }

      return successResponse({
        request: assigned,
        message: `Cleaning team assigned successfully.`,
      });
    } else {
      const result = createCleaningTeamSchema.safeParse(body);
      if (!result.success) {
        return errorResponse("VALIDATION_ERROR", "Invalid cleaning team data", 400, result.error.flatten().fieldErrors);
      }

      const team = db.createCleaningTeam(result.data);
      return successResponse({
        team,
        message: "Cleaning team created successfully",
      }, 201);
    }
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to process cleaning team operation", 500);
  }
}
