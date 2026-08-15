"use client";

import React, { useState, useEffect } from "react";
import { Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  ListFilter,
  Sparkles,
} from "lucide-react";

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guestName.toLowerCase().includes(search.toLowerCase()) ||
      b.guestEmail.toLowerCase().includes(search.toLowerCase()) ||
      (b.roomName && b.roomName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Confirmed</span>;
      case "checked_in":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lava-500/15 text-lava-400 border border-lava-500/30">Checked In</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">Completed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Pending</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lava-500/15 border border-lava-500/30 text-lava-400 text-xs font-bold mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Reservations & Availability Engine</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-heading">Bookings & Calendar</h1>
          <p className="text-xs text-titanium-400 mt-1">
            Accept or decline reservations, process check-ins, and inspect room schedule occupancy.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center p-1 bg-lava-900 border border-lava-800 rounded-xl">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === "list" ? "bg-lava-500 text-white shadow-sm" : "text-titanium-400 hover:text-white"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === "calendar" ? "bg-lava-500 text-white shadow-sm" : "text-titanium-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Availability Calendar</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-2 px-3 py-2 bg-lava-950 rounded-xl border border-lava-800 w-full sm:w-80">
          <Search className="w-4 h-4 text-lava-400 shrink-0" />
          <input
            type="text"
            placeholder="Search guest name, email, or suite..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-titanium-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "confirmed", "checked_in", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${
                statusFilter === status
                  ? "bg-lava-500 text-white shadow-sm"
                  : "bg-lava-950 border border-lava-800 text-titanium-400 hover:text-white"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === "calendar" ? (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-heading">
              August 2026 Room Schedule & Occupancy
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Booked Stay
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-lava-500" /> Check-in Day
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="p-2 font-bold text-titanium-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const dateStr = `2026-08-${day < 10 ? "0" + day : day}`;
              const dayBookings = bookings.filter(
                (b) => dateStr >= b.checkInDate && dateStr <= b.checkOutDate
              );
              const isOccupied = dayBookings.length > 0;

              return (
                <div
                  key={day}
                  className={`min-h-[75px] p-2 rounded-xl border text-left flex flex-col justify-between transition ${
                    isOccupied
                      ? "bg-lava-900 border-lava-500/40 shadow-sm"
                      : "bg-lava-950/60 border-lava-800/60 text-titanium-500"
                  }`}
                >
                  <span className={`text-xs font-bold ${isOccupied ? "text-white" : "text-titanium-500"}`}>
                    {day}
                  </span>
                  {isOccupied && (
                    <div className="space-y-0.5">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div
                          key={b.id}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-lava-500/20 text-lava-300 truncate"
                        >
                          {b.guestName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="glass-panel rounded-3xl overflow-hidden border border-lava-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-lava-900 border-b border-lava-800 text-titanium-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Guest Details</th>
                  <th className="p-4">Room Category</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lava-800/60 text-titanium-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-titanium-400">
                      Loading reservations...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-titanium-400">
                      No bookings found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-lava-900/50 transition">
                      <td className="p-4">
                        <p className="font-bold text-white text-sm font-heading">{b.guestName}</p>
                        <p className="text-[11px] text-titanium-400">{b.guestEmail} • {b.guestPhone}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-white">{b.roomName || "Standard Room"}</p>
                        <p className="text-[11px] text-titanium-400">{b.guestsCount} Guests</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-white">{formatDate(b.checkInDate)}</p>
                        <p className="text-[10px] text-titanium-400">to {formatDate(b.checkOutDate)}</p>
                      </td>
                      <td className="p-4 font-mono font-bold text-white">
                        {formatCurrency(b.totalPrice)}
                      </td>
                      <td className="p-4">{getStatusBadge(b.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === "confirmed" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "checked_in")}
                                className="px-2.5 py-1 rounded-lg bg-lava-500/15 border border-lava-500/30 text-lava-400 hover:bg-lava-500 hover:text-white transition text-[11px] font-bold"
                              >
                                Check In
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition text-[11px]"
                                title="Decline reservation"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {b.status === "checked_in" && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, "completed")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition text-[11px] font-bold"
                            >
                              Check Out & Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
