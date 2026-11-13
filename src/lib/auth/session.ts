import { User, UserRole } from "@/types";
import { db } from "@/lib/db/store";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Resolves the currently authenticated Supabase user (JWT is validated
 * server-side by the Supabase client from the session cookie) and maps it to
 * the application user record, provisioning one lazily on first login.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    return null;
  }

  return getOrCreateAppUser(user);
}

export function isAllowedAppRole(role: string | undefined): role is Exclude<UserRole, "admin"> {
  return role === "hotel_owner" || role === "customer";
}

/**
 * Finds the matching application user for a Supabase auth user (by auth id or
 * email) and creates one on first sign-in using the auth user's metadata.
 * Role/email/name/phone come from Supabase; never from client input here.
 */
export function getOrCreateAppUser(sbUser: SupabaseUser): User {
  const email = sbUser.email as string;
  const meta = (sbUser.user_metadata ?? {}) as Record<string, unknown>;

  const existing = db.findUserByAuthId(sbUser.id) ?? db.findUserByEmail(email);

  if (existing) {
    // Link the auth id if it is not already set (e.g. legacy demo account).
    if (!existing.authId) {
      db.updateUser(existing.id, { authId: sbUser.id });
    }
    return existing;
  }

  const rawRole = typeof meta.role === "string" ? meta.role : undefined;
  const role: Exclude<UserRole, "admin"> = isAllowedAppRole(rawRole) ? rawRole : "hotel_owner";

  return db.createUser({
    name:
      typeof meta.name === "string" && meta.name.trim().length >= 2
        ? meta.name.trim()
        : email.split("@")[0],
    email,
    phone: typeof meta.phone === "string" ? meta.phone : undefined,
    role,
    authId: sbUser.id,
  });
}

/**
 * Returns a user object safe to send to clients (never exposes password hashes).
 */
export function toPublicUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}