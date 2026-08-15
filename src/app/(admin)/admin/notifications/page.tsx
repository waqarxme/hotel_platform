"use client";

import React, { useState, useEffect } from "react";
import { Hotel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Select } from "@/components/ui/input";
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Megaphone,
} from "lucide-react";

export default function AdminNotificationsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    recipientId: "all",
    title: "Platform Maintenance & Cleaning Schedule Update",
    message: "We have upgraded our cleaning dispatch team in all major regions. Please check your free cleaning quota in your dashboard.",
    type: "info" as "info" | "success" | "warning" | "danger",
  });

  useEffect(() => {
    fetch("/api/admin/hotels")
      .then((res) => res.json())
      .then((data) => setHotels(data.hotels || []))
      .catch((e) => console.error(e));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Notification broadcast dispatched to hotel owners!");
        setForm({
          recipientId: "all",
          title: "",
          message: "",
          type: "info",
        });
      } else {
        setErrorMessage(data.error?.message || "Failed to dispatch notification");
      }
    } catch (e) {
      setErrorMessage("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recipientOptions = [
    { label: "All Registered Hotel Owners (Broadcast)", value: "all" },
    ...hotels.map((h) => ({
      label: `${h.name} (${h.businessName})`,
      value: h.ownerId,
    })),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">
          Owner Broadcast & Notification Dispatcher
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Send announcements, verification updates, or compliance reminders directly to hotel owners.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-cobalt-800 pb-4">
          <div className="p-2.5 rounded-xl bg-cobalt-500/10 text-cobalt-400">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading">Compose Notification Message</h2>
            <p className="text-xs text-slate-400">Targets in-app dashboards and owner alert centers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Target Recipient *"
            options={recipientOptions}
            value={form.recipientId}
            onChange={(e) => setForm({ ...form, recipientId: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Notification Title *"
              placeholder="e.g. Action Required: Verification Document"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <Select
              label="Notification Severity Type"
              options={[
                { label: "Information (Standard)", value: "info" },
                { label: "Success / Milestone", value: "success" },
                { label: "Warning / Action Required", value: "warning" },
                { label: "Danger / Urgent Compliance", value: "danger" },
              ]}
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as "info" | "success" | "warning" | "danger",
                })
              }
            />
          </div>

          <TextArea
            label="Announcement Body *"
            rows={4}
            placeholder="Type your message to hotel owners..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cobalt-800">
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="gap-2">
              <Send className="w-4 h-4" />
              <span>Dispatch Notification</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
