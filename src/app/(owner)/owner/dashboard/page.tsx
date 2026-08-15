"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Hotel, Room, Booking } from "@/types";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { PulseStatusBadge } from "@/components/ui/pulse-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BedDouble,
  CalendarCheck,
  DollarSign,
  Sparkles,
  Clock,
  AlertCircle,
  Building2,
  ArrowRight,
  Edit3,
  TrendingUp,
  Percent,
  Plus,
} from "lucide-react";

interface OwnerAnalyticsData {
  hotel: Hotel;
  totalRooms: number;
  totalUnits: number;
  occupancyRate: number;
  roomCategoriesCount: number;
  totalBookings: number;
  confirmedCount: number;
  checkedInCount: number;
  completedCount: number;
  cancelledCount: number;
  totalRevenue: number;
  averageRating: string;
  reviewsCount: number;
  eligibleCleanings: number;
  usedCleanings: number;
  availableCleanings: number;
  currentMilestoneBookings: number;
  milestoneProgressPercent: number;
  revenueTrend: { day: string; revenue: number }[];
  recentBookings: Booking[];
}

export default function OwnerDashboardPage() {
  const [data, setData] = useState<OwnerAnalyticsData | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [analyticsRes, roomsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/rooms"),
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setData(analyticsData);
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms || []);
      }
    } catch (e) {
      console.error("Error fetching dashboard", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-mono">Loading property operations telemetry...</p>
      </div>
    );
  }

  if (!data || !data.hotel) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto my-12 border border-slate-200 shadow-sm">
        <Building2 className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 font-heading">No Hotel Profile Linked</h2>
        <p className="text-xs text-slate-500">
          You have not submitted a hotel onboarding application yet.
        </p>
        <Link href="/register-hotel">
          <Button variant="primary" size="md" className="bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold">
            Submit Hotel Registration (Option 2)
          </Button>
        </Link>
      </div>
    );
  }

  const { hotel } = data;
  const isApproved = hotel.status === "approved" || hotel.status === "active";
  const maxDailyRevenue = Math.max(...data.revenueTrend.map((r) => r.revenue), 100);

  return (
    <div className="space-y-8 text-slate-900">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading">{hotel.name}</h1>
            <PulseStatusBadge status={hotel.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {hotel.businessName} • {hotel.city}, {hotel.country} • Category: {hotel.category}
          </p>
        </div>

        {isApproved && (
          <div className="flex items-center gap-3">
            <Link href="/owner/rooms">
              <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-700">
                <BedDouble className="w-4 h-4" />
                <span>Room Categories ({rooms.length})</span>
              </Button>
            </Link>
            <Link href="/owner/cleaning">
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold shadow-md shadow-red-500/20"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Request Free Cleaning</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* STATE 1: PENDING APPROVAL WORKFLOW BANNER */}
      {hotel.status === "pending_approval" && (
        <div className="rounded-3xl p-6 sm:p-8 bg-amber-50/70 border border-amber-200 space-y-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
              <Clock className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Application Under Administrative Review
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Your hotel registration request has been submitted and is in the <strong>Pending Approval</strong> queue. Room publishing, direct reservations, and automated cleaning rewards will unlock immediately upon verification by our administrators.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Application Submitted</p>
                <p className="text-[10px] text-slate-500">{formatDate(hotel.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs animate-pulse">
                2
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-900">Identity & License Verification</p>
                <p className="text-[10px] text-slate-500">Under Review by Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-60">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">Dashboard & Public Live</p>
                <p className="text-[10px] text-slate-400">Unlocks after approval</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: REJECTED STATE */}
      {hotel.status === "rejected" && (
        <div className="rounded-3xl p-6 sm:p-8 bg-rose-50 border border-rose-200 space-y-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-100 text-rose-700 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1">
              <h2 className="text-lg font-bold text-rose-950 font-heading">
                Registration Requires Updates & Resubmission
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                The administration reviewed your application and requested corrections:
              </p>
              <div className="p-4 rounded-2xl bg-white border border-rose-200 text-xs text-rose-700 font-medium">
                &ldquo;{hotel.rejectionReason || "Please verify documentation and contact info."}&rdquo;
              </div>
              <div className="pt-2">
                <Link href="/owner/profile">
                  <Button variant="primary" size="sm" className="gap-2 bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold">
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile & Resubmit Application</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: APPROVED & ACTIVE FULL TELEMETRY DASHBOARD */}
      {isApproved && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* 4 Primary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Occupancy Rate"
              value={`${data.occupancyRate}%`}
              icon={Percent}
              subtext={`${data.confirmedCount + data.checkedInCount} / ${data.totalUnits} Units Booked`}
              accentColor="lava"
            />
            <StatCard
              title="Total Bookings"
              value={data.totalBookings}
              icon={CalendarCheck}
              subtext={`${data.completedCount} checked out`}
              accentColor="emerald"
            />
            <StatCard
              title="Gross Revenue"
              value={formatCurrency(data.totalRevenue)}
              icon={DollarSign}
              subtext="Reservation volume"
              accentColor="emerald"
            />
            <StatCard
              title="Free Cleaning Quota"
              value={`${data.availableCleanings} Available`}
              icon={Sparkles}
              subtext={`${data.eligibleCleanings} total earned`}
              accentColor="amber"
            />
          </div>

          {/* 7-Day Revenue Graph & Occupancy Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 7-Day Revenue Curve Chart (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 space-y-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <h3 className="text-base font-bold text-slate-950 font-heading">
                      7-Day Revenue Trajectory
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live booking billing volume by day
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                  {formatCurrency(data.totalRevenue)} Gross
                </span>
              </div>

              {/* Bar Chart Visualizer */}
              <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100 px-2">
                {data.revenueTrend.map((r) => {
                  const heightPercent = Math.max(15, Math.round((r.revenue / maxDailyRevenue) * 100));
                  return (
                    <div key={r.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition duration-150">
                        ${r.revenue}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-lava-primary to-lava-orange group-hover:scale-105 transition-all duration-300 shadow-sm shadow-red-500/20"
                      />
                      <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-950 transition">
                        {r.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Updated in real-time from booking reservations</span>
                <Link href="/owner/bookings" className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1">
                  <span>Open Availability Calendar</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Quick Inventory Summary (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-red-600" />
                  <h3 className="text-base font-bold text-slate-950 font-heading">Room Inventory</h3>
                </div>
                <p className="text-xs text-slate-500">{rooms.length} Active Categories Configured</p>
              </div>

              <div className="space-y-3">
                {rooms.map((r) => (
                  <div key={r.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 truncate">{r.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {r.availableUnits} / {r.totalUnits} Units Available
                      </p>
                    </div>
                    <span className="font-mono font-bold text-red-600">${r.pricePerNight}/nt</span>
                  </div>
                ))}
              </div>

              <Link href="/owner/rooms" className="block pt-2">
                <Button variant="primary" size="sm" className="w-full gap-1.5 bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Room Category</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Milestone Progress for Free Cleaning */}
          <div className="bg-white rounded-3xl p-6 space-y-3 border-l-4 border-l-amber-500 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-950 font-heading">
                  Complimentary Professional Cleaning Milestone Tracker
                </h3>
              </div>
              <span className="text-xs font-semibold text-amber-700 font-mono font-bold">
                {data.availableCleanings} Free Cleanings Ready
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You earn <strong>1 Free Full-Property Deep Cleaning</strong> for every 5 completed guest reservations. Our certified cleaning squads sanitize your rooms at zero cost to your property.
            </p>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-lava-orange to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${Math.max(5, data.milestoneProgressPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{data.currentMilestoneBookings} of 5 bookings toward next free cleaning ({data.milestoneProgressPercent}%)</span>
              <Link href="/owner/cleaning" className="text-red-600 hover:text-red-700 font-bold">
                Request Cleaning Dispatch →
              </Link>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950 font-heading">Recent Guest Reservations</h3>
              <Link href="/owner/bookings">
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 gap-1">
                  <span>View All Bookings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {data.recentBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No bookings received yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Guest Name</th>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3.5 font-semibold text-slate-900">{b.guestName}</td>
                        <td className="px-4 py-3.5 text-slate-600">{b.roomName || "Standard Room"}</td>
                        <td className="px-4 py-3.5 text-slate-500 font-mono">
                          {b.checkInDate} to {b.checkOutDate}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-950">
                          {formatCurrency(b.totalPrice)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              b.status === "confirmed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : b.status === "checked_in"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
