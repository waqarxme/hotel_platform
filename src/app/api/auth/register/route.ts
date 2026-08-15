import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { registerUserSchema } from "@/lib/schemas/auth";
import { createSessionCookieValue, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session";
import { errorResponse, successResponse } from "@/lib/auth/rbac";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerUserSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid registration data", 400, result.error.flatten().fieldErrors);
    }

    const { email, name, phone, role } = result.data;
    const existing = db.findUserByEmail(email);

    if (existing) {
      return errorResponse("EMAIL_TAKEN", "An account with this email already exists", 409);
    }

    const newUser = db.createUser({
      name,
      email,
      role,
      phone,
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
