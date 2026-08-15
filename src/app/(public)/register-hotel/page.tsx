"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Select } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { siteConfig } from "@/config/site";
import {
  Building2,
  MapPin,
  FileCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function RegisterHotelPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    // Step 1
    hotelName: "",
    businessName: "",
    category: "4 Star",
    totalRooms: 20,
    description: "",

    // Step 2
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Pakistan",
    googleMapsUrl: "",

    // Step 3
    businessLicenseUrl: "",
    cnicUrl: "",
    logoUrl: "",
    coverImageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
    amenities: ["Free Wi-Fi", "Air Conditioning", "24/7 Room Service"],
  });

  const categories = siteConfig.categories.map((c) => ({ label: c, value: c }));

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter((a) => a !== amenity) : [...prev.amenities, amenity],
      };
    });
  };

  const handleNext = () => {
    setErrorMessage("");
    if (currentStep === 1) {
      if (!formData.hotelName || !formData.businessName || !formData.description) {
        setErrorMessage("Please fill in property name, business name, and description.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.email || !formData.phone || !formData.address || !formData.city) {
        setErrorMessage("Please complete all contact and location address fields.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(3, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/hotels/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/owner/dashboard");
      } else {
        setErrorMessage(data.error?.message || "Failed to submit registration request.");
      }
    } catch {
      setErrorMessage("Network error occurred. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Option 2: Partner Onboarding Wizard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 font-heading">
              Register Your Hotel Property
            </h1>
            <p className="text-xs text-slate-500">
              Submit your hospitality listing for administrative verification and instant dashboard activation.
            </p>
          </div>

          <Link href="/login">
            <button className="px-4 py-2 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-300 shadow-2xs transition-all">
              Already Registered? Sign In
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: STEPPER FORM */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stepper Progress Indicator */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { step: 1, title: "1. Overview", icon: Building2 },
                { step: 2, title: "2. Contact & Location", icon: MapPin },
                { step: 3, title: "3. Documents & Media", icon: FileCheck },
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isDone = currentStep > s.step;
                return (
                  <div
                    key={s.step}
                    className={`p-3 rounded-2xl border transition-all ${
                      isActive
                        ? "bg-white border-2 border-red-600 shadow-md text-slate-950"
                        : isDone
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-slate-100 border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <s.icon
                        className={`w-4 h-4 ${
                          isActive ? "text-red-600" : isDone ? "text-emerald-600" : "text-slate-400"
                        }`}
                      />
                      <span className="text-xs font-bold">{s.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form Panel */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-xl shadow-slate-200/50">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* STEP 1: Property Overview */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-sm font-bold text-slate-950 font-heading border-b border-slate-100 pb-2">
                      1. Property & Business Overview
                    </h3>

                    <Input
                      label="Hotel / Property Name *"
                      placeholder="e.g. Serena Grand Palace"
                      value={formData.hotelName}
                      onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                      required
                    />

                    <Input
                      label="Legal Business / Owner Name *"
                      placeholder="e.g. Serena Hospitality Group Ltd."
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="Property Category *"
                        options={categories}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                      <Input
                        label="Total Rooms *"
                        type="number"
                        min={1}
                        value={formData.totalRooms}
                        onChange={(e) => setFormData({ ...formData, totalRooms: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>

                    <TextArea
                      label="Hotel Narrative Description *"
                      rows={3}
                      placeholder="Describe your suites, mountain views, restaurant dining, and guest services..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      helperText="Minimum 20 characters for administrative review."
                      required
                    />
                  </div>
                )}

                {/* STEP 2: Location & Contact */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-sm font-bold text-slate-950 font-heading border-b border-slate-100 pb-2">
                      2. Location & Contact Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Contact Email *"
                        type="email"
                        placeholder="contact@hotel.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                      <Input
                        label="Phone Number *"
                        placeholder="+92 300 1234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <Input
                      label="Street Address *"
                      placeholder="Full street address and landmark"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="City *"
                        placeholder="e.g. Islamabad, Lahore, Naran"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                      <Input
                        label="Country *"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        required
                      />
                    </div>

                    <Input
                      label="Google Maps URL (Optional)"
                      placeholder="https://maps.google.com/?q=..."
                      value={formData.googleMapsUrl}
                      onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                    />
                  </div>
                )}

                {/* STEP 3: Verification Documents & Media */}
                {currentStep === 3 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <h3 className="text-sm font-bold text-slate-950 font-heading border-b border-slate-100 pb-2">
                      3. Identity Verification & Visual Media (Auto WebP Compressed)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ImageUpload
                        label="Business License / NTN (Optional)"
                        helperText="Upload license doc or tax certificate"
                        isDocument
                        value={formData.businessLicenseUrl}
                        onChange={(url) => setFormData({ ...formData, businessLicenseUrl: url })}
                      />
                      <ImageUpload
                        label="CNIC Identity Scan (Optional)"
                        helperText="National ID card or passport scan"
                        isDocument
                        value={formData.cnicUrl}
                        onChange={(url) => setFormData({ ...formData, cnicUrl: url })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <ImageUpload
                        label="Property Logo"
                        value={formData.logoUrl}
                        onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                      />
                      <ImageUpload
                        label="Cover Banner Photo"
                        value={formData.coverImageUrl}
                        onChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Featured Amenities</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {siteConfig.amenitiesList.slice(0, 9).map((amenity) => {
                          const isSelected = formData.amenities.includes(amenity);
                          return (
                            <button
                              type="button"
                              key={amenity}
                              onClick={() => toggleAmenity(amenity)}
                              className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-1.5 transition ${
                                isSelected
                                  ? "bg-red-50 border-red-500 text-red-700 font-semibold"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-red-600" : "text-slate-400"}`} />
                              <span className="truncate">{amenity}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Highly-Visible Stepper Action Buttons */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 shadow-2xs transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous Step</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-lava-primary via-lava-orange to-red-600 hover:opacity-95 text-white shadow-lg shadow-red-500/25 transition active:scale-95"
                    >
                      <span>Continue to Step {currentStep + 1}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-lg shadow-emerald-500/30 transition active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? "Submitting Application..." : "Submit Registration Request"}</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT 5 COLS: REAL-TIME PROPERTY PREVIEW MOCKUP */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Live Public Card Preview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-mono font-bold">
                Real-Time
              </span>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl space-y-4">
              <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.coverImageUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200"}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white shadow-md">
                    {formData.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Partner
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold drop-shadow-md">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {formData.city || "City Name"}, {formData.country}
                  </span>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-3">
                <h3 className="text-lg font-bold text-slate-950 font-heading truncate">
                  {formData.hotelName || "Your Hotel Name"}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {formData.description || "Your property narrative description will appear here on the public explorer."}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {formData.amenities.slice(0, 3).map((a) => (
                    <span key={a} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                      {a}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Capacity</span>
                    <p className="text-sm font-bold text-slate-900 font-heading">{formData.totalRooms} Rooms</p>
                  </div>
                  <span className="text-xs font-bold text-red-600">Ready for Bookings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
