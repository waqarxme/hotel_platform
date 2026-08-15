"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Notification } from "@/types";
import {
  Bell,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Home,
} from "lucide-react";

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/admin/dashboard" },
  ];

  const labelMap: Record<string, string> = {
    admin: "Admin",
    dashboard: "Dashboard",
    hotels: "Hotels",
    cleaning: "Cleaning",
    notifications: "Notifications",
    analytics: "Analytics",
    create: "Add Hotel",
  };

  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    const label = labelMap[seg] ?? seg;
    if (seg !== "admin" && seg !== "dashboard") {
      crumbs.push({ label, href: path });
    }
  }

  return crumbs;
}

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const crumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user ?? null);
        if (d.user) {
          fetch("/api/notifications")
            .then((r) => r.json())
            .then((nd) => {
              setNotifications(nd.notifications ?? []);
              setUnreadCount(nd.unreadCount ?? 0);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-200 bg-white shadow-sm z-40">
      {/* Left: Brand + Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Brand wordmark */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-red-500/40 shadow-sm group-hover:border-red-500/70 transition">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand-logo.jpg" alt="AuraHotels" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-extrabold text-slate-950 font-heading group-hover:text-red-600 transition">
            Aura<span className="text-red-600">Hotels</span>
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-wider">
            Admin
          </span>
        </Link>

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-slate-200" />

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-1 text-xs">
          <Link href="/" className="text-slate-400 hover:text-slate-600 transition p-1 rounded-md hover:bg-slate-100">
            <Home className="w-3.5 h-3.5" />
          </Link>
          {crumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <Link
                href={crumb.href}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  i === crumbs.length - 1
                    ? "text-slate-900 bg-slate-100 font-bold"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Bell + User */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu((p) => !p)}
            className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse border-2 border-white px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/80 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-red-600 hover:text-red-700 font-bold transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No notifications</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <Link
                      key={n.id}
                      href={n.link ?? "#"}
                      onClick={() => setShowNotifMenu(false)}
                      className={`block px-4 py-3 hover:bg-slate-50 transition ${!n.read ? "bg-red-50/60" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />}
                        <div className={!n.read ? "" : "pl-3.5"}>
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User info */}
        {user && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
          </div>
        )}

        {/* Avatar */}
        {user && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #FF3B30, #FF9500)" }}
          >
            {user.name.charAt(0)}
          </div>
        )}

        {/* Admin badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200">
          <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Admin</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
