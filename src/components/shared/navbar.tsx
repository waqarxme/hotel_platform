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
  Bell,
  User as UserIcon,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);

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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setHotel(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-r from-lava-primary via-lava-orange to-red-600 text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform duration-200">
            <HotelIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-950 tracking-tight font-heading group-hover:text-red-600 transition-colors">
              Cobalt<span className="text-red-600">Hotels</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 border border-red-200/80 text-red-700 rounded-md">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold">
          <Link
            href="/"
            className={`transition-colors ${
              pathname === "/"
                ? "text-red-600 font-bold"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Explore Hotels
          </Link>
          <Link
            href="/register-hotel"
            className={`flex items-center gap-1.5 transition-colors ${
              pathname === "/register-hotel"
                ? "text-red-600 font-bold"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>List Your Hotel</span>
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Admin Console</span>
            </Link>
          )}

          {user?.role === "hotel_owner" && (
            <Link
              href="/owner/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold transition-colors"
            >
              <Building2 className="w-4 h-4 text-red-600" />
              <span>Owner Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell for logged-in users */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors"
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
                    <span className="text-xs font-bold text-slate-950 font-heading">Notifications</span>
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
                              : "bg-slate-50 border-slate-100 text-slate-500"
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

          {/* User Profile or Authentication CTA Buttons */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200 border border-slate-200 transition-colors shadow-xs"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-lava-primary to-lava-orange text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-950 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role.replace("_", " ")}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold"
                >
                  <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/register-hotel">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-gradient-to-r from-lava-primary via-lava-orange to-red-600 hover:opacity-95 text-white font-bold shadow-md shadow-red-500/25"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  <span>List Property</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
