import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { loginSchema } from "@/lib/schemas/auth";
import { createSessionCookieValue, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session";
import { errorResponse, successResponse } from "@/lib/auth/rbac";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid credentials provided", 400, result.error.flatten().fieldErrors);
    }

    const { email } = result.data;
    const user = db.findUserByEmail(email);

    if (!user) {
      return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const cookieValue = createSessionCookieValue(user);
    const response = successResponse({
      user,
      message: `Welcome back, ${user.name}!`,
    });

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: cookieValue,
    });

    return response;
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred during login", 500);
  }
}
