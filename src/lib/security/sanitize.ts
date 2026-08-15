/**
 * Security utilities for XSS prevention, URL scheme validation, and IDOR guards.
 */

/**
 * Escapes HTML control characters from user text inputs to prevent stored XSS.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validates that a URL uses safe protocols (http, https, data for images) and rejects javascript: or vbscript:
 */
export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim().toLowerCase();
  if (trimmed === "") return true;

  // Block dangerous pseudo-protocols
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("data:text/html")
  ) {
    return false;
  }

  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("data:application/pdf")
  );
}

/**
 * Strips dangerous control characters and trims string
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
}
