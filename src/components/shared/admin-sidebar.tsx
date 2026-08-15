"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Sparkles,
  Bell,
  BarChart3,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/admin/hotels?status=pending_approval")
      .then((res) => res.json())
      .then((data) => {
        if (data.counts?.pending !== undefined) {
          setPendingCount(data.counts.pending);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navigation = [
    { name: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Hotel Queues", href: "/admin/hotels", icon: Building2, count: pendingCount },
    { name: "Add Hotel (Option 1)", href: "/admin/hotels/create", icon: PlusCircle },
    { name: "Cleaning Operations", href: "/admin/cleaning", icon: Sparkles },
    { name: "Owner Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shadow-sm">
      <div className="space-y-6">
        {/* Admin Badge */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-600">
              Master Admin Console
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900 font-heading">Cobalt Control Plane</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                    {item.count}
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
