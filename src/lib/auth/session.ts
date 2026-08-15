import { cookies } from "next/headers";
import { User, UserRole } from "@/types";
import { db } from "@/lib/db/store";

const SESSION_COOKIE_NAME = "hotel_platform_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  hotelId?: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const raw = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
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
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export const SESSION_COOKIE_OPTIONS = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
