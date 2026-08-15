import { cookies } from "next/headers";
import crypto from "crypto";
import { User, UserRole } from "@/types";
import { db } from "@/lib/db/store";
import { env } from "@/config/env";

const SESSION_COOKIE_NAME = "hotel_platform_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  hotelId?: string;
}

function signPayload(encoded: string): string {
  return crypto.createHmac("sha256", env.JWT_SECRET).update(encoded).digest("hex");
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const [encoded, signature] = sessionCookie.value.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = signPayload(encoded);
  const provided = Buffer.from(signature);
  const valid = Buffer.from(expected);
  if (provided.length !== valid.length || !crypto.timingSafeEqual(provided, valid)) {
    return null;
  }

  try {
    const raw = Buffer.from(encoded, "base64").toString("utf-8");
    const payload = JSON.parse(raw) as SessionPayload;
    const user = db.findUserById(payload.userId);
    return user ?? null;
  } catch {
    return null;
  }
}

export function createSessionCookieValue(user: User): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    hotelId: user.hotelId,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `${encoded}.${signPayload(encoded)}`;
}

/**
 * Returns a user object safe to send to clients (never exposes password hashes).
 */
export function toPublicUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export const SESSION_COOKIE_OPTIONS = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};