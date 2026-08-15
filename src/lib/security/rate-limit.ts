import { NextRequest } from "next/server";

interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  capacity: number; // Max requests allowed in window
  refillRatePerSec: number; // Tokens added per second
}

export function checkRateLimit(
  req: NextRequest,
  keyPrefix = "global",
  options: RateLimitOptions = { capacity: 60, refillRatePerSec: 1 }
): { allowed: boolean; remaining: number } {
  // Extract identifier: IP or token
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record) {
    record = { tokens: options.capacity, lastRefill: now };
    rateLimitStore.set(key, record);
  }

  // Refill tokens based on elapsed time
  const elapsedSec = (now - record.lastRefill) / 1000;
  record.tokens = Math.min(
    options.capacity,
    record.tokens + elapsedSec * options.refillRatePerSec
  );
  record.lastRefill = now;

  if (record.tokens >= 1) {
    record.tokens -= 1;
    return { allowed: true, remaining: Math.floor(record.tokens) };
  }

  return { allowed: false, remaining: 0 };
}
