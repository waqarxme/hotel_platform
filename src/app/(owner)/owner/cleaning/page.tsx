"use client";

import React, { useState, useEffect } from "react";
import { CleaningRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, TextArea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import {
  Sparkles,
  CheckCircle2,
  Truck,
  AlertCircle,
} from "lucide-react";

export default function OwnerCleaningPage() {
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [eligibility, setEligibility] = useState<{
    isEligible: boolean;
    totalEarned: number;
    used: number;
    available: number;
  }>({
    isEligible: false,
    totalEarned: 0,
    used: 0,
    available: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    roomNumbers: "Rooms 101, 102 & Executive Suites",
    requestedDate: "2026-08-25",
    specialInstructions: "Deep sanitize carpet and steam clean mattresses after peak weekend.",
  });

  const fetchCleaningData = async () => {
    try {
      const res = await fetch("/api/cleaning");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        if (data.eligibility) setEligibility(data.eligibility);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaningData();
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/cleaning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setSuccessMessage("Cleaning request dispatched! An admin will assign a specialized team.");
        fetchCleaningData();
      } else {
        setErrorMessage(data.error?.message || "Failed to submit cleaning request");
      }
    } catch (e) {
      setErrorMessage("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading cleaning services...</div>;
  }

  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 font-heading">
            Free Professional Cleaning Program
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complimentary deep sanitation and room preparation based on your completed booking volume.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="gap-2 bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold shadow-md shadow-red-500/20"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Request Cleaning Service</span>
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Program Eligibility Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border-l-4 border-l-amber-500 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">
              Milestone Reward Status
            </span>
            <h2 className="text-xl font-bold text-slate-950 font-heading">
              {eligibility.available > 0
                ? `${eligibility.available} Free Deep Cleanings Available`
                : "Building Booking Quota for Next Free Cleaning"}
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Every 5 confirmed guest stays unlocks 1 complete deep sanitization package dispatched by Cobalt certified cleaning partners.
            </p>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Earned</p>
              <p className="text-xl font-bold text-slate-900 font-mono">{eligibility.totalEarned}</p>
            </div>
            <div className="text-center border-l border-slate-200 pl-6">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Claimed</p>
              <p className="text-xl font-bold text-slate-600 font-mono">{eligibility.used}</p>
            </div>
            <div className="text-center border-l border-slate-200 pl-6">
              <p className="text-[10px] text-emerald-600 uppercase font-semibold">Available Now</p>
              <p className="text-xl font-bold text-emerald-600 font-mono">{eligibility.available}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cleaning History Table */}
      <div className="bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-950 font-heading">Cleaning Service Requests</h3>

        {requests.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No cleaning requests dispatched yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Rooms To Clean</th>
                  <th className="px-4 py-3">Scheduled Date</th>
                  <th className="px-4 py-3">Assigned Team</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Special Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{r.roomNumbers}</td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(r.requestedDate)}</td>
                    <td className="px-4 py-3.5">
                      {r.assignedTeamName ? (
                        <span className="flex items-center gap-1.5 text-red-600 font-medium">
                          <Truck className="w-3.5 h-3.5" /> {r.assignedTeamName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending assignment</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === "assigned" || r.status === "in_progress"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.status === "completed"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">
                      {r.specialInstructions || "Standard deep sanitation"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request Complimentary Deep Cleaning"
        description="Select room numbers and target date for sanitation squad arrival."
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Room Numbers / Categories to Clean *"
            placeholder="e.g. Rooms 101, 102, 105 or Whole Floor 2"
            value={form.roomNumbers}
            onChange={(e) => setForm({ ...form, roomNumbers: e.target.value })}
            required
          />

          <Input
            label="Target Service Date *"
            type="date"
            value={form.requestedDate}
            onChange={(e) => setForm({ ...form, requestedDate: e.target.value })}
            required
          />

          <TextArea
            label="Special Sanitization Instructions"
            rows={3}
            placeholder="e.g. Focus on upholstery steam cleaning, air duct filters, balcony power washing..."
            value={form.specialInstructions}
            onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold"
            >
              Dispatch Cleaning Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
