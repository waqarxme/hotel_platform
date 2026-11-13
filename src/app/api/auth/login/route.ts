import { NextRequest } from "next/server";
import { db } from "@/lib/db/store";
import { loginSchema } from "@/lib/schemas/auth";
import { errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { getOrCreateAppUser, toPublicUser } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/auth/password";
import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";

const DEMO_EMAILS = new Set(["admin@hotelplatform.com", "owner@serenapalace.com"]);

/**
 * Bootstraps a pre-seeded demo account into Supabase Auth on first login.
 * Works when the Supabase project has email confirmation disabled; otherwise
 * returns needsConfirmation so the UI can guide the user.
 */
async function bootstrapDemoAccount(
  supabase: SupabaseClient,
  email: string,
  password: string
): Promise<{ user?: SupabaseUser; session?: boolean; needsConfirmation?: boolean }> {
  const lower = email.toLowerCase();
  const demoUser = db.findUserByEmail(lower);
  if (!DEMO_EMAILS.has(lower) || !demoUser?.passwordHash) return {};

  if (!verifyPassword(password, demoUser.passwordHash)) return {};

  const { data, error } = await supabase.auth.signUp({
    email: demoUser.email,
    password,
    options: {
      data: {
        name: demoUser.name,
        phone: demoUser.phone ?? "",
        role: demoUser.role,
      },
    },
  });

  if (error || !data.user) return {};

  return {
    user: data.user,
    session: Boolean(data.session),
    needsConfirmation: !data.session,
  };
}

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
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Demo account bootstrap fallback for pre-seeded credentials
      if (error.status === 400) {
        const bootstrapped = await bootstrapDemoAccount(supabase, email, password);
        if (bootstrapped.user && bootstrapped.session) {
          const appUser = getOrCreateAppUser(bootstrapped.user);
          return successResponse({
            user: toPublicUser(appUser),
            message: `Welcome back, ${appUser.name}!`,
          });
        }
        if (bootstrapped.needsConfirmation) {
          return errorResponse(
            "EMAIL_NOT_CONFIRMED",
            "This demo account was created but requires email confirmation before signing in.",
            403
          );
        }
      }

      if (error.message.toLowerCase().includes("not confirmed")) {
        return errorResponse("EMAIL_NOT_CONFIRMED", "Please confirm your email address before signing in.", 403);
      }

      return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const appUser = getOrCreateAppUser(data.user);
    return successResponse({
      user: toPublicUser(appUser),
      message: `Welcome back, ${appUser.name}!`,
    });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred during login", 500);
  }
}