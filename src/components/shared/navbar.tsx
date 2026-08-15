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
    <header className="sticky top-0 z-40 w-full border-b border-lava-800/80 bg-lava-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-lava-500 text-white shadow-md shadow-lava-500/25 group-hover:scale-105 transition duration-200">
            <HotelIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight font-heading group-hover:text-lava-400 transition">
              Cobalt<span className="text-lava-500">Hotels</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-lava-900 border border-lava-800 text-lava-400 rounded">
              Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
          <Link
            href="/"
            className={`transition ${
              pathname === "/" ? "text-lava-400 font-bold" : "text-titanium-300 hover:text-white"
            }`}
          >
            Explore Hotels
          </Link>
          <Link
            href="/register-hotel"
            className={`flex items-center gap-1.5 transition ${
              pathname === "/register-hotel" ? "text-lava-400 font-bold" : "text-titanium-300 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-lava-400" />
            <span>List Your Hotel (Option 2)</span>
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1 text-lava-400 hover:text-lava-300 font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}
          {user?.role === "hotel_owner" && (
            <Link
              href="/owner/dashboard"
              className="flex items-center gap-1 text-lava-400 hover:text-lava-300 font-bold"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Owner Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Right Actions & Demo Switcher */}
        <div className="flex items-center gap-3">
          {/* Notification Bell (If Logged In) */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl bg-lava-900 border border-lava-800 text-titanium-300 hover:text-white hover:border-lava-600 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lava-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-lava-900 border border-lava-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-lava-800 mb-2">
                    <span className="text-xs font-bold text-white font-heading">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-lava-400 hover:text-lava-300 font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-titanium-400 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.link || "#"}
                          onClick={() => setShowNotifMenu(false)}
                          className={`block p-2.5 rounded-xl border transition ${
                            !n.read
                              ? "bg-lava-950 border-lava-500/30 text-white"
                              : "bg-lava-950/50 border-lava-800/60 text-titanium-400"
                          }`}
                        >
                          <p className="text-xs font-bold text-white">{n.title}</p>
                          <p className="text-[11px] text-titanium-300 mt-0.5 line-clamp-2">{n.message}</p>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lava-900 border border-lava-800 text-xs font-semibold text-titanium-200 hover:text-white hover:border-lava-600 transition shadow-sm"
              title="Quickly switch between the 2 default accounts"
            >
              <UserCheck className="w-3.5 h-3.5 text-lava-400" />
              <span className="hidden sm:inline">Default Accounts</span>
              <ChevronDown className="w-3 h-3 text-titanium-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-lava-900 border border-lava-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-lava-800 mb-1">
                  <p className="text-[10px] font-bold text-titanium-400 uppercase tracking-wider">
                    Default Users (1 of each role)
                  </p>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleQuickLogin("admin@hotelplatform.com")}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-lava-800 text-xs flex items-center justify-between group transition"
                  >
                    <div>
                      <p className="font-bold text-white group-hover:text-lava-400">Master Admin</p>
                      <p className="text-[10px] text-titanium-400 font-mono">admin@hotelplatform.com</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-lava-500/20 text-lava-400 font-bold">
                      Admin
                    </span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin("owner@serenapalace.com")}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-lava-800 text-xs flex items-center justify-between group transition"
                  >
                    <div>
                      <p className="font-bold text-emerald-400">Hotel Owner (Serena)</p>
                      <p className="text-[10px] text-titanium-400 font-mono">owner@serenapalace.com</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      Owner
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Status / Login Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-lava-900 border border-lava-800 hover:border-lava-600 transition"
              >
                <div className="w-6 h-6 rounded-full bg-lava-500/20 text-lava-400 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-titanium-400 capitalize">{user.role.replace("_", " ")}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-titanium-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register-hotel">
                <Button variant="primary" size="sm">
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
