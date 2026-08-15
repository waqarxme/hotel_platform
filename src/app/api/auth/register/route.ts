import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { registerUserSchema } from "@/lib/schemas/auth";
import { createSessionCookieValue, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session";
import { errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "auth-register", { capacity: 5, refillRatePerSec: 0.1 });
  if (secError) return secError;

  try {
    const body = await req.json();
    const result = registerUserSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid registration data", 400, result.error.flatten().fieldErrors);
    }

    const { email, name, phone, role, password } = result.data;

    // Privilege escalation guard: admin accounts can never be self-registered
    if (role === "admin") {
      return errorResponse("FORBIDDEN", "Administrator accounts cannot be self-registered", 403);
    }

    const existing = db.findUserByEmail(email);

    if (existing) {
      return errorResponse("EMAIL_TAKEN", "An account with this email already exists", 409);
    }

    const newUser = db.createUser({
      name,
      email,
      role,
      phone,
      passwordHash: hashPassword(password),
    });

    const cookieValue = createSessionCookieValue(newUser);
    const response = successResponse({
      user: newUser,
      message: "Account created successfully",
    }, 201);

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: cookieValue,
    });

    return response;
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to register user", 500);
  }
}