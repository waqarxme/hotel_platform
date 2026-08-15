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
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/types";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/admin/hotels?status=pending_approval")
      .then((res) => res.json())
      .then((data) => {
        if (data.counts?.pending !== undefined) {
          setPendingCount(data.counts.pending);
        }
      })
      .catch(() => {});

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => {});
  }, [pathname]);

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Hotel Queues", href: "/admin/hotels", icon: Building2, count: pendingCount },
    { name: "Add Hotel Directly", href: "/admin/hotels/create", icon: PlusCircle },
    { name: "Cleaning Operations", href: "/admin/cleaning", icon: Sparkles },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="w-60 xl:w-64 shrink-0 bg-white border-r border-slate-200 min-h-screen flex flex-col shadow-sm">
      {/* Admin Identity Block */}
      <div className="px-4 py-5 border-b border-slate-100 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-50 border border-red-200">
            <ShieldCheck className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900 font-heading">
              Aura<span className="text-red-600">Hotels</span>
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Admin Console</p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Platform Live</span>
          {pendingCount > 0 && (
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold animate-pulse">
              {pendingCount} pending
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold px-3 pb-2">
          Management
        </p>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group",
                isActive
                  ? "text-white font-bold shadow-md shadow-red-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
              style={
                isActive
                  ? { background: "linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)" }
                  : {}
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white animate-pulse">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User info + actions */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #FF3B30, #FF9500)" }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Public Portal</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
