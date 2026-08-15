import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { loginSchema } from "@/lib/schemas/auth";
import { createSessionCookieValue, SESSION_COOKIE_OPTIONS, toPublicUser } from "@/lib/auth/session";
import { errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { verifyPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "auth-login", { capacity: 10, refillRatePerSec: 0.2 });
  if (secError) return secError;

  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid credentials provided", 400, result.error.flatten().fieldErrors);
    }

    const { email, password } = result.data;
    const user = db.findUserByEmail(email);

    // Generic failure message prevents account enumeration
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const cookieValue = createSessionCookieValue(user);
    const response = successResponse({
      user: toPublicUser(user),
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