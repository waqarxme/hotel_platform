import { NextRequest } from "next/server";

interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const MAX_ENTRIES = 10_000;

function extractClientIp(req: NextRequest): string {
  // Prefer the platform-provided IP that proxies append server-side.
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // X-Forwarded-For is client-spoofable: only trust the LAST entry, which is
  // the value appended by the closest trusted proxy (if any).
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return "127.0.0.1";
}

function evictStaleRecords(): void {
  if (rateLimitStore.size < MAX_ENTRIES) return;
  const now = Date.now();
  const staleWindow = 60 * 60 * 1000; // 1 hour
  for (const [key, record] of rateLimitStore) {
    if (now - record.lastRefill > staleWindow) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitOptions {
  capacity: number; // Max requests allowed in window
  refillRatePerSec: number; // Tokens added per second
}

export function checkRateLimit(
  req: NextRequest,
  keyPrefix = "global",
  options: RateLimitOptions = { capacity: 60, refillRatePerSec: 1 }
): { allowed: boolean; remaining: number } {
  const ip = extractClientIp(req);
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  evictStaleRecords();

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