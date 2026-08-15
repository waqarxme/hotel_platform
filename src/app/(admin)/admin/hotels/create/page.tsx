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
  PlusCircle,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export default function AdminCreateHotelPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    hotelName: "",
    businessName: "",
    ownerName: "",
    ownerEmail: "",
    phone: "+92 300 ",
    address: "",
    city: "Islamabad",
    country: "Pakistan",
    category: "4 Star",
    totalRooms: 15,
    description: "",
    logoUrl: "",
    coverImageUrl: "",
    autoApprove: true,
  });

  const categories = siteConfig.categories.map((c) => ({ label: c, value: c }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/hotels/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Hotel created successfully and assigned to ${form.ownerEmail}!`);
        setTimeout(() => {
          router.push(`/admin/hotels/${data.hotel.id}`);
        }, 1200);
      } else {
        setErrorMessage(data.error?.message || "Failed to create hotel profile");
      }
    } catch (e) {
      setErrorMessage("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-900">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/hotels"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hotel Queues</span>
        </Link>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          Option 1 Onboarding Pathway
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading">
          Admin Direct Hotel Profile Creation
        </h1>
        <p className="text-xs text-slate-500">
          Option 1: Directly create a hotel profile and assign it to an existing or new hotel owner account.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hotel Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 font-heading border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" />
            <span>Property Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hotel Name *"
              placeholder="e.g. Serena Elite Residency"
              value={form.hotelName}
              onChange={(e) => setForm({ ...form, hotelName: e.target.value })}
              required
            />
            <Input
              label="Legal Business / Company Name *"
              placeholder="e.g. Elite Hospitality Ltd"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Hotel Category"
              options={categories}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Input
              label="Total Room Capacity"
              type="number"
              min={1}
              value={form.totalRooms}
              onChange={(e) => setForm({ ...form, totalRooms: parseInt(e.target.value) || 1 })}
            />
            <Input
              label="Contact Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <TextArea
            label="Property Overview Description *"
            rows={3}
            placeholder="Narrative description of amenities, location, and rooms..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        {/* Location */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 font-heading border-b border-slate-100 pb-3">
            Location Address
          </h2>
          <Input
            label="Street Address *"
            placeholder="Street 14, Blue Area"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City *"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <Input
              label="Country *"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Owner Account Assignment (Section 1) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-4 border-l-4 border-l-red-600 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 font-heading border-b border-slate-100 pb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-red-600" />
            <span>Assigned Hotel Owner Account</span>
          </h2>
          <p className="text-xs text-slate-600">
            If the email is already registered, the hotel is linked to that account. Otherwise, a new hotel owner account is automatically provisioned.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Owner Full Name *"
              placeholder="e.g. Asad Qureshi"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              required
            />
            <Input
              label="Owner Login Email Address *"
              type="email"
              placeholder="owner@hotelresidency.com"
              value={form.ownerEmail}
              onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 font-heading border-b border-slate-100 pb-3">
            Visual Brand Assets (Optional)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ImageUpload
              label="Hotel Logo"
              value={form.logoUrl}
              onChange={(url) => setForm({ ...form, logoUrl: url })}
            />
            <ImageUpload
              label="Cover Image"
              value={form.coverImageUrl}
              onChange={(url) => setForm({ ...form, coverImageUrl: url })}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/admin/hotels">
            <Button type="button" variant="outline" size="md" className="border-slate-200 text-slate-700">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="gap-2 bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create & Activate Hotel Profile</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
