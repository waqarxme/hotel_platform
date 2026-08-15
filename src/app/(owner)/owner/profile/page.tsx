"use client";

import React, { useState, useEffect } from "react";
import { Hotel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Select } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { siteConfig } from "@/config/site";
import { CheckCircle2, AlertCircle, Save, X } from "lucide-react";

export default function OwnerProfilePage() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    googleMapsUrl: "",
    description: "",
    totalRooms: 20,
    category: "4 Star",
    logoUrl: "",
    coverImageUrl: "",
    galleryImages: [] as string[],
    amenities: [] as string[],
  });

  const categories = siteConfig.categories.map((c) => ({ label: c, value: c }));

  const fetchHotel = async () => {
    try {
      const res = await fetch("/api/hotels/my-hotel");
      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
        setFormData({
          name: data.hotel.name || "",
          businessName: data.hotel.businessName || "",
          phone: data.hotel.phone || "",
          address: data.hotel.address || "",
          city: data.hotel.city || "",
          country: data.hotel.country || "Pakistan",
          googleMapsUrl: data.hotel.googleMapsUrl || "",
          description: data.hotel.description || "",
          totalRooms: data.hotel.totalRooms || 10,
          category: data.hotel.category || "4 Star",
          logoUrl: data.hotel.logoUrl || "",
          coverImageUrl: data.hotel.coverImageUrl || "",
          galleryImages: data.hotel.galleryImages || [],
          amenities: data.hotel.amenities || [],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, []);

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...prev.amenities, amenity] };
      }
    });
  };

  const handleAddGalleryImage = (url: string) => {
    if (url) {
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, url],
      }));
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/hotels/my-hotel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setHotel(data.hotel);
        setStatusMessage({
          type: "success",
          text:
            hotel?.status === "rejected"
              ? "Profile updated and application resubmitted for admin review!"
              : "Hotel profile updated successfully!",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error?.message || "Failed to update profile",
        });
      }
    } catch (e) {
      setStatusMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading hotel profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 font-heading">Hotel Profile & Media</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your property narrative, gallery showcase, and amenities.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 font-heading border-b border-slate-100 pb-3">
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hotel Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Business / Trading Name *"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              options={categories}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Total Room Count"
              type="number"
              min={1}
              value={formData.totalRooms}
              onChange={(e) => setFormData({ ...formData, totalRooms: parseInt(e.target.value) || 1 })}
            />
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <TextArea
            label="Property Description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Location Coordinates */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 font-heading border-b border-slate-100 pb-3">
            Location & Map Coordinates
          </h2>

          <Input
            label="Street Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <Input
            label="Google Maps URL"
            value={formData.googleMapsUrl}
            onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
          />
        </div>

        {/* Brand Media & Gallery */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 font-heading border-b border-slate-100 pb-3">
            Brand Media & Photo Gallery
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ImageUpload
              label="Hotel Logo"
              value={formData.logoUrl}
              onChange={(url) => setFormData({ ...formData, logoUrl: url })}
            />
            <ImageUpload
              label="Cover Image"
              value={formData.coverImageUrl}
              onChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
            />
          </div>

          {/* Unlimited Gallery Images (Section 3) */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hotel Photo Gallery
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.galleryImages.map((imgUrl, index) => (
                <div
                  key={index}
                  className="relative h-28 rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <ImageUpload
              label="Add Photo to Gallery"
              helperText="Upload any room, dining, pool, or amenity photo"
              value=""
              onChange={handleAddGalleryImage}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 font-heading border-b border-slate-100 pb-3">
            Selected Hotel Amenities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {siteConfig.amenitiesList.map((amenity) => {
              const isSelected = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`p-3 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition ${
                    isSelected
                      ? "bg-red-50 border-red-500 text-red-700 font-semibold"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-red-600" : "text-slate-400"}`} />
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            className="gap-2 bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold"
          >
            <Save className="w-4 h-4" />
            <span>
              {hotel?.status === "rejected" ? "Save & Resubmit Application" : "Save Changes"}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
