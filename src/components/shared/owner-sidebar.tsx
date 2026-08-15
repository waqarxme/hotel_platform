"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Hotel } from "@/types";
import { PulseStatusBadge } from "@/components/ui/pulse-badge";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarDays,
  Star,
  TrendingUp,
  Sparkles,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface OwnerSidebarProps {
  hotel: Hotel | null;
}

export function OwnerSidebar({ hotel }: OwnerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isApproved = hotel?.status === "approved" || hotel?.status === "active";

  const navigation = [
    { name: "Dashboard Overview", href: "/owner/dashboard", icon: LayoutDashboard, alwaysEnabled: true },
    { name: "Hotel Profile & Media", href: "/owner/profile", icon: Building2, alwaysEnabled: true },
    { name: "Rooms & Pricing", href: "/owner/rooms", icon: BedDouble, alwaysEnabled: false },
    { name: "Bookings & Calendar", href: "/owner/bookings", icon: CalendarDays, alwaysEnabled: false },
    { name: "Customer Reviews", href: "/owner/reviews", icon: Star, alwaysEnabled: false },
    { name: "Revenue Analytics", href: "/owner/revenue", icon: TrendingUp, alwaysEnabled: false },
    { name: "Free Cleaning Service", href: "/owner/cleaning", icon: Sparkles, alwaysEnabled: false, badge: hotel?.cleaningServiceEligible ? "Eligible" : undefined },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shadow-sm">
      <div className="space-y-6">
        {/* Hotel Info & Live Status Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {hotel?.category || "Hotel Property"}
            </span>
            {hotel && <PulseStatusBadge status={hotel.status} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 truncate font-heading">
              {hotel?.name || "My Hotel Property"}
            </h4>
            <p className="text-[11px] text-slate-500 truncate">{hotel?.city || "Awaiting Setup"}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isLocked = !isApproved && !item.alwaysEnabled;

            if (isLocked) {
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 cursor-not-allowed opacity-60 select-none"
                  title="Unlocked after hotel approval by admin"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                    Locked
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition duration-150",
                  isActive
                    ? "bg-gradient-to-r from-lava-primary to-lava-orange text-white shadow-md shadow-red-500/25 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-100 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Public Portal</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
