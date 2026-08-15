"use client";

import React, { useState, useEffect } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  Percent,
} from "lucide-react";

interface OwnerRevenueData {
  totalRevenue: number;
  totalBookings: number;
  completedCount: number;
  totalRooms: number;
  totalUnits: number;
  occupancyRate: number;
  averageRating: string;
  revenueTrend: { day: string; revenue: number }[];
}

export default function OwnerRevenuePage() {
  const [analytics, setAnalytics] = useState<OwnerRevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-mono">Compiling property revenue analytics...</p>
      </div>
    );
  }

  const maxDaily = Math.max(...analytics.revenueTrend.map((m) => m.revenue), 100);
  const averageDailyRate =
    analytics.totalBookings > 0
      ? Math.round(analytics.totalRevenue / analytics.totalBookings)
      : 240;

  return (
    <div className="space-y-8 text-slate-900">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading">
          Revenue & Financial Yield
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Financial performance reporting, occupancy yield, and daily room billing telemetry.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Gross Yield"
          value={formatCurrency(analytics.totalRevenue)}
          icon={DollarSign}
          change="+21.4%"
          isPositive={true}
          accentColor="lava"
        />
        <StatCard
          title="Total Bookings"
          value={analytics.totalBookings}
          icon={CalendarCheck}
          subtext={`${analytics.completedCount} completed`}
          accentColor="emerald"
        />
        <StatCard
          title="Average Room Rate"
          value={formatCurrency(averageDailyRate)}
          icon={TrendingUp}
          subtext="Per night booked"
          accentColor="lava"
        />
        <StatCard
          title="Occupancy Yield"
          value={`${analytics.occupancyRate}%`}
          icon={Percent}
          subtext={`${analytics.totalUnits} Units active`}
          accentColor="emerald"
        />
      </div>

      {/* Daily / Weekly Revenue Visual Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950 font-heading">7-Day Daily Revenue Trajectory</h2>
            <p className="text-xs text-slate-500 mt-1">Direct guest reservation billings</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            USD ($)
          </span>
        </div>

        {/* Bar Chart */}
        <div className="pt-8 pb-4 flex items-end justify-between gap-3 sm:gap-4 h-64 border-b border-slate-100">
          {analytics.revenueTrend.map((item) => {
            const heightPercent = Math.max(15, Math.round((item.revenue / maxDaily) * 100));
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                  ${item.revenue}
                </div>
                <div
                  className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-lava-primary to-lava-orange transition-all duration-300 relative shadow-sm shadow-red-500/20"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-950 mt-1">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
