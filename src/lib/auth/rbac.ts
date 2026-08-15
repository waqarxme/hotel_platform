import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./session";
import { User, UserRole, ApiErrorResponse, Hotel } from "@/types";
import { db } from "@/lib/db/store";
import { validateCsrf, attachCsrfCookie, generateCsrfToken } from "@/lib/security/csrf";
import { checkRateLimit, RateLimitOptions } from "@/lib/security/rate-limit";

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  fieldErrors?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    },
    { status }
  );
}

export function successResponse<T>(
  data: T,
  status = 200,
  options?: { cacheControl?: string; setCsrf?: boolean }
): NextResponse<T> {
  const response = NextResponse.json(data, { status });

  if (options?.cacheControl) {
    response.headers.set("Cache-Control", options.cacheControl);
  }

  if (options?.setCsrf) {
    const token = generateCsrfToken();
    attachCsrfCookie(response, token);
  }

  return response;
}

export interface AuthContext {
  user: User;
  hotel?: Hotel;
}

export async function verifyAuth(
  allowedRoles?: UserRole[]
): Promise<{ auth: AuthContext | null; errorResponse: NextResponse<ApiErrorResponse> | null }> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      auth: null,
      errorResponse: errorResponse("UNAUTHORIZED", "Authentication required to access this resource", 401),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      auth: null,
      errorResponse: errorResponse("FORBIDDEN", "You lack permission to perform this action", 403),
    };
  }

  let hotel: Hotel | undefined;
  if (user.role === "hotel_owner") {
    hotel = user.hotelId ? db.findHotelById(user.hotelId) : db.findHotelByOwnerId(user.id);
  }

  return {
    auth: { user, hotel },
    errorResponse: null,
  };
}

export function guardSecurity(
  req: NextRequest,
  rateLimitCategory = "api",
  rateLimitOpts?: RateLimitOptions
): NextResponse<ApiErrorResponse> | null {
  // 1. Rate Limiting Check
  const rateResult = checkRateLimit(req, rateLimitCategory, rateLimitOpts);
  if (!rateResult.allowed) {
    return errorResponse(
      "RATE_LIMIT_EXCEEDED",
      "Too many requests. Please slow down and try again.",
      429
    );
  }

  // 2. CSRF Check for mutating operations
  if (!validateCsrf(req)) {
    return errorResponse(
      "CSRF_TOKEN_INVALID",
      "Invalid or missing CSRF token",
      403
    );
  }

  return null;
}
