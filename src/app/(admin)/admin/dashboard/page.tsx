"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Hotel } from "@/types";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { PulseStatusBadge } from "@/components/ui/pulse-badge";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Clock,
  Sparkles,
  PlusCircle,
  ArrowRight,
  DollarSign,
  TrendingUp,
  MapPin,
  Activity,
} from "lucide-react";

interface AdminAnalyticsData {
  totalHotels: number;
  activeHotels: number;
  pendingHotels: number;
  rejectedHotels: number;
  suspendedHotels: number;
  totalBookings: number;
  totalRevenue: number;
  activeCleaningDispatches: number;
  totalCleaningTeams: number;
  monthlyRevenue: { month: string; revenue: number; bookings: number }[];
  cityDistribution: { city: string; hotelsCount: number; revenue: number }[];
  funnel: { total: number; pending: number; approved: number; active: number; rejected: number; suspended: number };
  recentHotels: Hotel[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("Aug");

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-mono">Loading real-time admin metrics...</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.monthlyRevenue.map((m) => m.revenue), 1000);

  return (
    <div className="space-y-8 text-slate-900">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Master Control Plane</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading">
            Platform Operations & Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live multi-tenant telemetry, verification queues, GMV volume, and hygiene fleet dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/hotels">
            <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-700">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Review Queues ({data.pendingHotels})</span>
            </Button>
          </Link>
          <Link href="/admin/hotels/create">
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold shadow-md shadow-red-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Hotel (Option 1)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Pending Approval Alert Banner */}
      {data.pendingHotels > 0 && (
        <div className="rounded-2xl p-5 bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950 font-heading">
                {data.pendingHotels} Hotel Registration Request(s) Awaiting Review
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                New properties have submitted verification documents and are waiting for administrative sign-off.
              </p>
            </div>
          </div>

          <Link href="/admin/hotels?status=pending_approval">
            <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold border-none shadow-sm">
              Open Approval Queue
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Properties"
          value={data.totalHotels}
          icon={Building2}
          subtext={`${data.activeHotels} Active / Approved`}
          accentColor="lava"
        />
        <StatCard
          title="Pending Review"
          value={data.pendingHotels}
          icon={Clock}
          subtext="Requires verification"
          accentColor="amber"
        />
        <StatCard
          title="Platform GMV Volume"
          value={formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          subtext={`${data.totalBookings} total guest stays`}
          accentColor="emerald"
        />
        <StatCard
          title="Cleaning Dispatches"
          value={data.activeCleaningDispatches}
          icon={Sparkles}
          subtext={`${data.totalCleaningTeams} squads on duty`}
          accentColor="violet"
        />
      </div>

      {/* 4. Real Interactive GMV Revenue Chart + Regional Occupancy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Dynamic Revenue Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 space-y-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <h3 className="text-base font-bold text-slate-950 font-heading">
                  Platform GMV Revenue & Reservation Volume
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly trajectory computed from live reservation transactions
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              +38% vs Q1
            </span>
          </div>

          {/* Bar / Column Chart Visualizer */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-100 px-2">
            {data.monthlyRevenue.map((m) => {
              const heightPercent = Math.max(12, Math.round((m.revenue / maxRevenue) * 100));
              const isSelected = selectedMonth === m.month;

              return (
                <div
                  key={m.month}
                  onClick={() => setSelectedMonth(m.month)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                >
                  <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition duration-150">
                    ${m.revenue}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-t from-lava-primary to-lava-orange shadow-md shadow-red-500/30"
                        : "bg-slate-200 group-hover:bg-slate-300"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-semibold transition ${
                      isSelected ? "text-red-600 font-bold" : "text-slate-500 group-hover:text-slate-900"
                    }`}
                  >
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Showing Jan - Aug 2026</span>
            <span className="font-mono text-slate-900">
              Selected: <strong className="text-red-600">{selectedMonth}</strong> • {formatCurrency(data.monthlyRevenue.find((m) => m.month === selectedMonth)?.revenue || data.totalRevenue)}
            </span>
          </div>
        </div>

        {/* Regional City Distribution (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <h3 className="text-base font-bold text-slate-950 font-heading">Regional Distribution</h3>
            </div>
            <p className="text-xs text-slate-500">Active properties by destination</p>
          </div>

          <div className="space-y-3">
            {data.cityDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No city telemetry recorded</p>
            ) : (
              data.cityDistribution.map((c) => (
                <div key={c.city} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{c.city}</span>
                    <span className="text-red-600 font-mono font-semibold">{c.hotelsCount} Property</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (c.hotelsCount / Math.max(1, data.totalHotels)) * 100)}%` }}
                      className="h-full bg-red-600 rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href="/admin/hotels" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700">
              Manage All City Properties
            </Button>
          </Link>
        </div>
      </div>

      {/* 5. 4 Status Pipeline Funnel Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/hotels?status=pending_approval"
          className="p-4 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 transition group block shadow-xs"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">1. Pending Requests</p>
          <p className="text-2xl font-bold text-slate-950 font-mono mt-1">{data.pendingHotels}</p>
          <p className="text-[10px] text-slate-500 mt-1">Awaiting approval</p>
        </Link>

        <Link
          href="/admin/hotels?status=approved"
          className="p-4 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 transition group block shadow-xs"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">2. Approved & Active</p>
          <p className="text-2xl font-bold text-slate-950 font-mono mt-1">{data.activeHotels}</p>
          <p className="text-[10px] text-slate-500 mt-1">Live on public site</p>
        </Link>

        <Link
          href="/admin/hotels?status=rejected"
          className="p-4 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 transition group block shadow-xs"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">3. Rejected Hotels</p>
          <p className="text-2xl font-bold text-slate-950 font-mono mt-1">{data.rejectedHotels}</p>
          <p className="text-[10px] text-slate-500 mt-1">Feedback dispatched</p>
        </Link>

        <Link
          href="/admin/hotels?status=suspended"
          className="p-4 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 transition group block shadow-xs"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">4. Suspended Hotels</p>
          <p className="text-2xl font-bold text-slate-950 font-mono mt-1">{data.suspendedHotels}</p>
          <p className="text-[10px] text-slate-500 mt-1">Locked / Offline</p>
        </Link>
      </div>

      {/* 6. Recent Submissions Table */}
      <div className="bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Recent Hotel Submissions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Properties on the platform</p>
          </div>
          <Link href="/admin/hotels">
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 gap-1">
              <span>View All 4 Queues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Hotel Name</th>
                <th className="px-4 py-3">City / Category</th>
                <th className="px-4 py-3">Owner Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentHotels.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{h.name}</td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {h.city} • <span className="text-red-600 font-medium">{h.category}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono">{h.email}</td>
                  <td className="px-4 py-3.5">
                    <PulseStatusBadge status={h.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link href={`/admin/hotels/${h.id}`}>
                      <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                        Inspect Application
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
