import { NextRequest } from "next/server";
import { errorResponse, successResponse, guardSecurity } from "@/lib/auth/rbac";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/config/env";

const BUCKET_NAME = "hotel-assets";

/**
 * Helper to extract file path inside the bucket from a full Supabase public URL
 */
function extractStoragePath(url: string): string | null {
  if (!url || !url.includes(BUCKET_NAME)) return null;
  const parts = url.split(`${BUCKET_NAME}/`);
  return parts.length > 1 ? decodeURIComponent(parts[1]) : null;
}

export async function POST(req: NextRequest) {
  const secError = guardSecurity(req, "upload", { capacity: 30, refillRatePerSec: 1 });
  if (secError) return secError;

  try {
    const contentType = req.headers.get("content-type") || "";
    const supabase = getSupabaseServerClient();

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const previousUrl = formData.get("previousUrl") as string | null;
      const folder = (formData.get("folder") as string) || "hotels";

      if (!file) {
        return errorResponse("VALIDATION_ERROR", "File is required", 400);
      }

      // 1. If an old image existed, delete it from Supabase Storage
      if (previousUrl) {
        const oldPath = extractStoragePath(previousUrl);
        if (oldPath) {
          try {
            await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
          } catch (e) {
            console.error("Failed to delete old file:", e);
          }
        }
      }

      // 2. Prepare upload path
      const ext = file.name.split(".").pop() || "webp";
      const sanitizedName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      const fileName = `${folder}/${Date.now()}-${sanitizedName}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, buffer, {
          contentType: file.type || "image/webp",
          upsert: true,
        });

      if (error) {
        console.error("Supabase Storage Upload Error:", error);
        // If Supabase storage is not configured, fallback to base64 data URL
        const base64 = `data:${file.type || "image/webp"};base64,${buffer.toString("base64")}`;
        return successResponse({
          url: base64,
          fileName,
          fileType: file.type,
          message: "Uploaded as data URL",
        });
      }

      // 4. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return successResponse({
        url: publicUrlData.publicUrl,
        path: data.path,
        fileName,
        fileType: file.type,
        message: "File uploaded successfully to Supabase Storage",
      });
    }

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { fileName, fileType, dataUrl, previousUrl } = body;

      if (!dataUrl) {
        return errorResponse("VALIDATION_ERROR", "Data URL is required", 400);
      }

      // If old URL was provided, attempt to delete old file
      if (previousUrl) {
        const oldPath = extractStoragePath(previousUrl);
        if (oldPath) {
          try {
            await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
          } catch (e) {
            console.error("Failed to delete old file:", e);
          }
        }
      }

      return successResponse({
        url: dataUrl,
        fileName: fileName || "uploaded_file.webp",
        fileType: fileType || "image/webp",
        message: "File processed successfully",
      });
    }

    return errorResponse("BAD_REQUEST", "Unsupported content type for upload", 400);
  } catch (err) {
    console.error("Upload error:", err);
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to upload file", 500);
  }
}

export async function DELETE(req: NextRequest) {
  const secError = guardSecurity(req, "upload-delete");
  if (secError) return secError;

  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return errorResponse("VALIDATION_ERROR", "URL of file to delete is required", 400);
    }

    const path = extractStoragePath(url);
    if (!path) {
      return successResponse({ message: "No cloud file path found or external image" });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      return errorResponse("STORAGE_ERROR", error.message, 500);
    }

    return successResponse({ message: "File removed from Supabase storage successfully" });
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to delete file", 500);
  }
}
