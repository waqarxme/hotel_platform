import { NextRequest } from "next/server";
import { SESSION_COOKIE_OPTIONS } from "@/lib/auth/session";
import { successResponse, guardSecurity } from "@/lib/auth/rbac";

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "auth-logout");
  if (secError) return secError;

  const response = successResponse({ message: "Logged out successfully" });
  response.cookies.set({
    ...SESSION_COOKIE_OPTIONS,
    value: "",
    maxAge: 0,
  });
  return response;
}