"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Hotel, Room, Review } from "@/types";
import { Button } from "@/components/ui/button";
import { PulseStatusBadge } from "@/components/ui/pulse-badge";
import { Modal } from "@/components/ui/modal";
import { Input, TextArea, Select } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import {
  Building2,
  MapPin,
  FileText,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Phone,
  Mail,
  ShieldCheck,
  HelpCircle,
  Edit2,
  TrendingUp,
} from "lucide-react";

export default function AdminHotelInspectorPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<{ totalBookings: number; totalRevenue: number }>({
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modals State
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [requestInfoModal, setRequestInfoModal] = useState(false);
  const [editDetailsModal, setEditDetailsModal] = useState(false);

  // Form states
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [infoRequestMessage, setInfoRequestMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit Hotel Form State
  const [editFormData, setEditFormData] = useState({
    name: "",
    businessName: "",
    category: "4 Star",
    totalRooms: 20,
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "Pakistan",
    description: "",
    isVerified: true,
  });

  const fetchHotel = async () => {
    try {
      const res = await fetch(`/api/hotels/${hotelId}`);
      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
        setRooms(data.rooms || []);
        if (data.stats) setStats(data.stats);

        setEditFormData({
          name: data.hotel.name,
          businessName: data.hotel.businessName,
          category: data.hotel.category,
          totalRooms: data.hotel.totalRooms,
          phone: data.hotel.phone,
          email: data.hotel.email,
          address: data.hotel.address,
          city: data.hotel.city,
          country: data.hotel.country,
          description: data.hotel.description,
          isVerified: data.hotel.isVerified,
        });
      }
    } catch (e) {
      console.error("Failed to load hotel", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, [hotelId]);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      if (res.ok) {
        setApproveModal(false);
        fetchHotel();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason }),
      });
      if (res.ok) {
        setRejectModal(false);
        fetchHotel();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspensionReason) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspensionReason }),
      });
      if (res.ok) {
        setSuspendModal(false);
        fetchHotel();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    if (!confirm("Reactivate this hotel listing on the public platform?")) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/reactivate`, { method: "POST" });
      if (res.ok) {
        fetchHotel();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!infoRequestMessage) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/request-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: infoRequestMessage }),
      });
      if (res.ok) {
        setRequestInfoModal(false);
        setInfoRequestMessage("");
        fetchHotel();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVerification = async () => {
    if (!hotel) return;
    try {
      const res = await fetch(`/api/hotels/${hotelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !hotel.isVerified }),
      });
      if (res.ok) {
        fetchHotel();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEditDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/hotels/${hotelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        setEditDetailsModal(false);
        fetchHotel();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-titanium-400 text-xs">
        Loading property application data...
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Application Not Found</h2>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/hotels")}>
          Back to Queues
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Status Bar */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-lava-400 font-bold">{hotel.id}</span>
            <PulseStatusBadge status={hotel.status} />
            <button
              onClick={handleToggleVerification}
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold transition border ${
                hotel.isVerified
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-lava-950 text-titanium-400 border-lava-800 hover:text-white"
              }`}
              title="Click to toggle verified badge"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{hotel.isVerified ? "Verified Property" : "Unverified (Click to Verify)"}</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white font-heading">{hotel.name}</h1>
          <p className="text-xs text-titanium-400">{hotel.businessName} • Submitted {formatDate(hotel.createdAt)}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDetailsModal(true)}
            className="gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </Button>

          {hotel.status === "pending_approval" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRequestInfoModal(true)}
                className="gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Request Info</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setApproveModal(true)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setRejectModal(true)}
                className="gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </Button>
            </>
          )}

          {(hotel.status === "approved" || hotel.status === "active") && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setSuspendModal(true)}
              className="gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Suspend Hotel</span>
            </Button>
          )}

          {hotel.status === "suspended" && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleReactivate}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reactivate Listing</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats for this Property */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-[11px] font-bold text-titanium-400 uppercase tracking-wider">Total Rooms</p>
          <p className="text-2xl font-bold text-white font-heading mt-1">{hotel.totalRooms}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-[11px] font-bold text-titanium-400 uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-bold text-white font-heading mt-1">{stats.totalBookings}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-[11px] font-bold text-titanium-400 uppercase tracking-wider">Gross Revenue</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-[11px] font-bold text-titanium-400 uppercase tracking-wider">Free Cleanings</p>
          <p className="text-2xl font-bold text-lava-400 font-heading mt-1">
            {hotel.usedFreeCleanings} / {hotel.eligibleFreeCleanings}
          </p>
        </div>
      </div>

      {/* Grid: Application Info & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <h3 className="text-base font-bold text-white font-heading border-b border-lava-800 pb-3">
              Application Details & Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-lava-950 border border-lava-800 space-y-1">
                <span className="text-[10px] text-titanium-400 uppercase font-semibold">Contact Email</span>
                <p className="text-white font-medium">{hotel.email}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-lava-950 border border-lava-800 space-y-1">
                <span className="text-[10px] text-titanium-400 uppercase font-semibold">Phone Number</span>
                <p className="text-white font-medium">{hotel.phone}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-lava-950 border border-lava-800 space-y-1 sm:col-span-2">
                <span className="text-[10px] text-titanium-400 uppercase font-semibold">Physical Address</span>
                <p className="text-white font-medium">{hotel.address}, {hotel.city}, {hotel.country}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-titanium-300 uppercase tracking-wider">Narrative Description</h4>
              <p className="text-xs text-titanium-200 leading-relaxed bg-lava-950 p-4 rounded-xl border border-lava-800 whitespace-pre-line">
                {hotel.description}
              </p>
            </div>

            {hotel.adminNotes && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Admin Notes & Remarks</h4>
                <p className="text-xs text-titanium-200">{hotel.adminNotes}</p>
              </div>
            )}

            {hotel.rejectionReason && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                <h4 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Rejection Reason Provided</h4>
                <p className="text-xs text-rose-200">{hotel.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Documents & Media Inspector */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white font-heading border-b border-lava-800 pb-2">
              Submitted Documents & Scans
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-lava-950 border border-lava-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Business License / Tax Reg</span>
                  {hotel.businessLicenseUrl ? (
                    <span className="text-[10px] font-bold text-emerald-400">Attached</span>
                  ) : (
                    <span className="text-[10px] text-titanium-500">Not provided</span>
                  )}
                </div>
                {hotel.businessLicenseUrl && (
                  <div className="relative h-32 rounded-xl overflow-hidden bg-lava-900 border border-lava-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hotel.businessLicenseUrl} alt="License" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-lava-950 border border-lava-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">CNIC / Passport Identity Scan</span>
                  {hotel.cnicUrl ? (
                    <span className="text-[10px] font-bold text-emerald-400">Attached</span>
                  ) : (
                    <span className="text-[10px] text-titanium-500">Not provided</span>
                  )}
                </div>
                {hotel.cnicUrl && (
                  <div className="relative h-32 rounded-xl overflow-hidden bg-lava-900 border border-lava-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hotel.cnicUrl} alt="CNIC" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* APPROVE MODAL */}
      <Modal
        isOpen={approveModal}
        onClose={() => setApproveModal(false)}
        title="Confirm Application Approval"
        description={`Approving ${hotel.name} will unlock their owner dashboard and publish approved rooms.`}
      >
        <div className="space-y-4">
          <TextArea
            label="Internal Admin Notes (Optional)"
            placeholder="Document verification remarks, license number check..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setApproveModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              isLoading={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm & Approve Hotel
            </Button>
          </div>
        </div>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject Application Request"
        description="Provide a constructive reason so the owner can correct their application and resubmit."
      >
        <div className="space-y-4">
          <TextArea
            label="Rejection Reason *"
            rows={3}
            placeholder="e.g. Missing clear CNIC scan, property license expired, or address verification required..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              isLoading={isProcessing}
              disabled={!rejectionReason}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* REQUEST INFO MODAL */}
      <Modal
        isOpen={requestInfoModal}
        onClose={() => setRequestInfoModal(false)}
        title="Request Additional Information"
        description={`Send a direct notification to the owner of ${hotel.name} specifying missing details.`}
      >
        <div className="space-y-4">
          <TextArea
            label="Information Required *"
            rows={3}
            placeholder="e.g. Please provide your official tax NTN certificate and high-resolution cover photo..."
            value={infoRequestMessage}
            onChange={(e) => setInfoRequestMessage(e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRequestInfoModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRequestInfo}
              isLoading={isProcessing}
              disabled={!infoRequestMessage}
            >
              Send Request to Owner
            </Button>
          </div>
        </div>
      </Modal>

      {/* SUSPEND MODAL */}
      <Modal
        isOpen={suspendModal}
        onClose={() => setSuspendModal(false)}
        title="Suspend Hotel Listing"
        description="Suspended hotels are immediately removed from public listings and cannot take new bookings."
      >
        <div className="space-y-4">
          <TextArea
            label="Suspension Reason *"
            rows={3}
            placeholder="e.g. Quality violation, regulatory inspection failure, or guest complaint investigation..."
            value={suspensionReason}
            onChange={(e) => setSuspensionReason(e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSuspendModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleSuspend}
              isLoading={isProcessing}
              disabled={!suspensionReason}
            >
              Confirm Suspension
            </Button>
          </div>
        </div>
      </Modal>

      {/* EDIT HOTEL DETAILS MODAL */}
      <Modal
        isOpen={editDetailsModal}
        onClose={() => setEditDetailsModal(false)}
        title="Edit Hotel Information Directly"
        description="Update hotel specifications, contact details, or capacity."
      >
        <form onSubmit={handleSaveEditDetails} className="space-y-4">
          <Input
            label="Hotel Name *"
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            required
          />
          <Input
            label="Business Name *"
            value={editFormData.businessName}
            onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              options={siteConfig.categories.map((c) => ({ label: c, value: c }))}
              value={editFormData.category}
              onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
            />
            <Input
              label="Total Rooms"
              type="number"
              min={1}
              value={editFormData.totalRooms}
              onChange={(e) => setEditFormData({ ...editFormData, totalRooms: parseInt(e.target.value) || 1 })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              required
            />
            <Input
              label="City"
              value={editFormData.city}
              onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
              required
            />
          </div>
          <TextArea
            label="Description"
            rows={3}
            value={editFormData.description}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            required
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditDetailsModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isProcessing}>
              Save Hotel Details
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
