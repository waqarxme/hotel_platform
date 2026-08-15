import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_COOKIE_NAME = "hotel_csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Checks that the request either carries a valid double-submit CSRF token
 * (cookie value echoed in the X-CSRF-Token header) or originates from the
 * application's own origin (Origin / Referer header check).
 */
export function validateCsrf(req: NextRequest): boolean {
  // Safe methods do not require CSRF checks
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true;
  }

  // Double-submit token check (defense in depth, used by the client wrapper)
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  if (cookieToken && headerToken) {
    try {
      if (
        crypto.timingSafeEqual(
          Buffer.from(cookieToken),
          Buffer.from(headerToken)
        )
      ) {
        return true;
      }
    } catch {
      // Fall through to origin check
    }
  }

  return isSameOriginRequest(req);
}

function isSameOriginRequest(req: NextRequest): boolean {
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");

  if (origin) {
    try {
      const o = new URL(origin);
      if (host) {
        return o.host === host;
      }
      // Fall back to configured app URL when Host is unavailable
      const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
      return o.host === appUrl.host;
    } catch {
      return false;
    }
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const r = new URL(referer);
      if (host) return r.host === host;
      const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
      return r.host === appUrl.host;
    } catch {
      return false;
    }
  }

  // No Origin/Referer present: non-browser client or a browser edge case.
  // Without a valid token we still reject to stay conservative for
  // cross-origin form submissions from old browsers.
  return false;
}

export function attachCsrfCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false, // Accessible by client JS to send in X-CSRF-Token header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}