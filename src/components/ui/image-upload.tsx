"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { UploadCloud, X, FileText, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { convertAndCompressToWebP } from "@/lib/image-optimizer";

export interface ImageUploadProps {
  label?: string;
  helperText?: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  isDocument?: boolean;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  label,
  helperText,
  value,
  onChange,
  accept = "image/*,.pdf",
  isDocument = false,
  folder = "hotels",
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [optimizedSize, setOptimizedSize] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    setIsUploading(true);
    setOptimizedSize(null);

    try {
      // 1. Client-Side WebP Conversion & Compression
      let fileToUpload = originalFile;
      if (!isDocument && originalFile.type.startsWith("image/")) {
        fileToUpload = await convertAndCompressToWebP(originalFile, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.82,
        });

        const sizeKb = Math.round(fileToUpload.size / 1024);
        setOptimizedSize(`${sizeKb} KB WebP`);
      }

      // 2. Upload to Supabase Storage API, deleting previous file if replacing
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", folder);
      if (value) {
        formData.append("previousUrl", value);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      } else {
        // Fallback to local Data URL on network fail
        const reader = new FileReader();
        reader.onload = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(fileToUpload);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (value) {
      // Trigger deletion of old file from Supabase storage
      try {
        fetch(`/api/upload?url=${encodeURIComponent(value)}`, { method: "DELETE" }).catch(() => {});
      } catch {
        // Ignored
      }
    }

    setOptimizedSize(null);
    onChange("");
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
            {label}
          </label>
          {optimizedSize && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-mono font-bold">
              <Sparkles className="w-3 h-3 text-emerald-600" /> {optimizedSize}
            </span>
          )}
        </div>
      )}

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-white p-2 shadow-sm">
          {isDocument || value.endsWith(".pdf") || value.startsWith("data:application/pdf") ? (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <FileText className="w-8 h-8 text-red-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">Verification Document Attached</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Secure Storage File Ready
                </p>
              </div>
            </div>
          ) : (
            <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-slate-200 text-[10px] font-mono text-slate-900 font-semibold shadow-xs">
                WebP Optimized
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3.5 right-3.5 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow-md z-10"
            title="Delete and remove image from storage"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-red-500 rounded-2xl cursor-pointer bg-slate-50/70 hover:bg-red-50/20 transition duration-200 group">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <div className="p-3 rounded-full bg-white border border-slate-200 text-red-600 group-hover:text-white group-hover:bg-gradient-to-r group-hover:from-lava-primary group-hover:to-lava-orange group-hover:scale-110 transition duration-200 shadow-sm">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isDocument ? (
              <FileText className="w-5 h-5" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>
          <p className="text-xs font-bold text-slate-900 mt-3 group-hover:text-red-600 transition">
            {isUploading ? "Compressing to WebP & Uploading..." : "Click to upload image or document"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 text-center">
            {helperText || "Auto-compressed & converted to WebP on upload"}
          </p>
        </label>
      )}
    </div>
  );
}
