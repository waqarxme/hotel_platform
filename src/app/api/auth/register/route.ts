import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { registerUserSchema } from "@/lib/schemas/auth";
import { errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { getOrCreateAppUser, toPublicUser } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

    if (db.findUserByEmail(email)) {
      return errorResponse("EMAIL_TAKEN", "An account with this email already exists", 409);
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone: phone ?? "", role },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return errorResponse("EMAIL_TAKEN", "An account with this email already exists", 409);
      }
      return errorResponse("INTERNAL_SERVER_ERROR", "Failed to register user", 500);
    }

    // When the project has email confirmation disabled, Supabase returns a
    // session immediately and the user is already signed in.
    if (data.session && data.user) {
      const appUser = getOrCreateAppUser(data.user);
      return successResponse(
        {
          user: toPublicUser(appUser),
          message: "Account created successfully",
          needsEmailConfirmation: false,
        },
        201
      );
    }

    return successResponse(
      {
        user: null,
        message: "Account created. Please check your email to confirm your address before signing in.",
        needsEmailConfirmation: true,
      },
      201
    );
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to register user", 500);
  }
}