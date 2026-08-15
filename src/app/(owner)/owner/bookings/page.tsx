"use client";

import React, { useState, useEffect } from "react";
import { Booking } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CalendarDays,
  Search,
  Calendar,
  ListFilter,
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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmed</span>;
      case "checked_in":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">Checked In</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Completed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
    }
  };

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Reservations & Availability Engine</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-950 font-heading">Bookings & Calendar</h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept or decline reservations, process check-ins, and inspect room schedule occupancy.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === "calendar"
                ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Availability Calendar</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 w-full sm:w-80">
          <Search className="w-4 h-4 text-red-600 shrink-0" />
          <input
            type="text"
            placeholder="Search guest name, email, or suite..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "confirmed", "checked_in", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${
                statusFilter === status
                  ? "bg-gradient-to-r from-lava-primary to-lava-orange text-white shadow-xs"
                  : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === "calendar" ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-950 font-heading">
              August 2026 Room Schedule & Occupancy
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Booked Stay
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Check-in Day
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="p-2 font-bold text-slate-400 uppercase tracking-wider">
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
                      ? "bg-red-50/40 border-red-200 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <span className={`text-xs font-bold ${isOccupied ? "text-slate-950" : "text-slate-400"}`}>
                    {day}
                  </span>
                  {isOccupied && (
                    <div className="space-y-0.5">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div
                          key={b.id}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 truncate"
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
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Guest Details</th>
                  <th className="p-4">Room Category</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Loading reservations...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No bookings found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <p className="font-bold text-slate-950 text-sm font-heading">{b.guestName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{b.guestEmail} • {b.guestPhone}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{b.roomName || "Standard Room"}</p>
                        <p className="text-[11px] text-slate-500">{b.guestsCount} Guests</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{formatDate(b.checkInDate)}</p>
                        <p className="text-[10px] text-slate-400 font-mono">to {formatDate(b.checkOutDate)}</p>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-950">
                        {formatCurrency(b.totalPrice)}
                      </td>
                      <td className="p-4">{getStatusBadge(b.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === "confirmed" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "checked_in")}
                                className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition text-[11px] font-bold"
                              >
                                Check In
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition text-[11px]"
                                title="Decline reservation"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {b.status === "checked_in" && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, "completed")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition text-[11px] font-bold"
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
