"use client";

import React, { useState, useEffect } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Building2,
  CalendarCheck,
  Sparkles,
  MapPin,
  ShieldCheck,
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
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <p className="text-xs text-slate-500 font-mono">Compiling platform telemetry...</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.monthlyRevenue.map((m) => m.revenue), 1000);

  return (
    <div className="space-y-8 text-slate-900">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading">
          Platform Fleet & Revenue Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Aggregated GMV performance across all verified properties and regional partner squads.
        </p>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Platform Gross Volume"
          value={formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          change="+28.4%"
          isPositive={true}
          accentColor="lava"
        />
        <StatCard
          title="Verified Properties"
          value={data.activeHotels}
          icon={Building2}
          subtext={`Out of ${data.totalHotels} total submissions`}
          accentColor="emerald"
        />
        <StatCard
          title="Guest Reservations"
          value={data.totalBookings}
          icon={CalendarCheck}
          subtext="Direct confirmed stays"
          accentColor="lava"
        />
        <StatCard
          title="Hygiene Squads On Duty"
          value={data.totalCleaningTeams}
          icon={Sparkles}
          subtext={`${data.activeCleaningDispatches} active dispatches`}
          accentColor="amber"
        />
      </div>

      {/* Interactive Monthly GMV Revenue Curve */}
      <div className="bg-white rounded-3xl p-6 space-y-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950 font-heading">
              Platform Gross Merchandise Value (GMV) Trend
            </h2>
            <p className="text-xs text-slate-500">Monthly reservation billing trajectory</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Live Trajectory
          </span>
        </div>

        <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100 px-2">
          {data.monthlyRevenue.map((m) => {
            const heightPercent = Math.max(15, Math.round((m.revenue / maxRevenue) * 100));
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                  ${m.revenue}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-lava-primary to-lava-orange group-hover:scale-105 transition-all duration-300 shadow-xs"
                />
                <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-950 transition">
                  {m.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution & Regional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional City Distribution */}
        <div className="bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <h2 className="text-base font-bold text-slate-950 font-heading">Destination Coverage</h2>
          </div>
          <div className="space-y-3 pt-2">
            {data.cityDistribution.map((item) => (
              <div key={item.city} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-900 font-semibold">{item.city}</span>
                  <span className="text-red-600 font-mono font-bold">{item.hotelsCount} Property</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: `${Math.min(100, (item.hotelsCount / Math.max(1, data.totalHotels)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Health */}
        <div className="bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-950 font-heading">Platform Operational Health</h2>
          </div>
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Application Review Average Turnaround</span>
              <span className="font-bold text-emerald-700 font-mono">1.2 Hours</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Cleaning Team Fulfillment Rate</span>
              <span className="font-bold text-emerald-700 font-mono">100%</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Supabase Edge DB Latency</span>
              <span className="font-bold text-emerald-700 font-mono">18ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
