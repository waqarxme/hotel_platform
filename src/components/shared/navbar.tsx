"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Hotel, Notification } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Hotel as HotelIcon,
  ShieldCheck,
  Building2,
  LogOut,
  Sparkles,
  ChevronDown,
  UserCheck,
  Bell,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setHotel(data.hotel);
        fetchNotifications();
      } else {
        setUser(null);
        setHotel(null);
      }
    } catch {
      setUser(null);
      setHotel(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickLogin = async (email: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setShowDemoMenu(false);
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/owner/dashboard");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setHotel(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-r from-lava-primary to-lava-orange text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition duration-200">
            <HotelIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight font-heading group-hover:text-red-600 transition">
              Cobalt<span className="text-red-600">Hotels</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 border border-red-200 text-red-700 rounded">
              Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <Link
            href="/"
            className={`transition ${
              pathname === "/" ? "text-red-600 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Explore Hotels
          </Link>
          <Link
            href="/register-hotel"
            className={`flex items-center gap-1.5 transition ${
              pathname === "/register-hotel" ? "text-red-600 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>List Your Hotel (Option 2)</span>
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}
          {user?.role === "hotel_owner" && (
            <Link
              href="/owner/dashboard"
              className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Owner Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Right Actions & Demo Switcher */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-900 font-heading">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-red-600 hover:text-red-700 font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.link || "#"}
                          onClick={() => setShowNotifMenu(false)}
                          className={`block p-2.5 rounded-xl border transition ${
                            !n.read
                              ? "bg-red-50/60 border-red-200 text-slate-900"
                              : "bg-slate-50/70 border-slate-100 text-slate-500"
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2 Default Accounts Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition shadow-sm"
              title="Quickly switch between default accounts"
            >
              <UserCheck className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Accounts</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Default Users (1 of each role)
                  </p>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleQuickLogin("admin@hotelplatform.com")}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs flex items-center justify-between group transition"
                  >
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-red-600">Master Admin</p>
                      <p className="text-[10px] text-slate-500 font-mono">admin@hotelplatform.com</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-bold border border-red-200">
                      Admin
                    </span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin("owner@serenapalace.com")}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs flex items-center justify-between group transition"
                  >
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-emerald-600">Hotel Owner (Serena)</p>
                      <p className="text-[10px] text-slate-500 font-mono">owner@serenapalace.com</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
                      Owner
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-lava-primary to-lava-orange text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role.replace("_", " ")}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-800 hover:bg-slate-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/register-hotel">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold shadow-md shadow-red-500/20"
                >
                  Partner With Us
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
