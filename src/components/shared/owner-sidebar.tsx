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
    <aside className="w-64 shrink-0 bg-lava-950 border-r border-lava-800/80 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Hotel Info & Live Status Banner */}
        <div className="p-3.5 rounded-2xl bg-lava-900 border border-lava-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-titanium-400 tracking-wider">
              {hotel?.category || "Hotel Property"}
            </span>
            {hotel && <PulseStatusBadge status={hotel.status} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white truncate font-heading">
              {hotel?.name || "My Hotel Property"}
            </h4>
            <p className="text-[11px] text-titanium-400 truncate">{hotel?.city || "Awaiting Setup"}</p>
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
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-titanium-500 cursor-not-allowed opacity-50 select-none"
                  title="Unlocked after hotel approval by admin"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-lava-900 text-titanium-400 font-bold">
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
                    ? "bg-lava-500 text-white shadow-md shadow-lava-500/25 font-bold"
                    : "text-titanium-300 hover:text-white hover:bg-lava-900"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-titanium-400")} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-signal-emerald/20 text-signal-emerald">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-lava-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-titanium-400 hover:text-white hover:bg-lava-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Main Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
