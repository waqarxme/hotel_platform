import { NextRequest } from "next/server";
import { successResponse, guardSecurity } from "@/lib/auth/rbac";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "auth-logout");
  if (secError) return secError;

  try {
    const supabase = getSupabaseServerClient();
    await supabase.auth.signOut();
    return successResponse({ message: "Logged out successfully" });
  } catch {
    return successResponse({ message: "Logged out successfully" });
  }
}