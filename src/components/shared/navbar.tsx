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
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="sticky top-3 z-50 w-full px-3 sm:px-6 lg:px-8">
      {/* Floating Pill Container */}
      <header className="max-w-6xl mx-auto rounded-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 px-4 sm:px-6 py-2.5 transition-all duration-300">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="p-2 rounded-full bg-gradient-to-r from-lava-primary via-lava-orange to-red-600 text-white shadow-md shadow-red-500/30 group-hover:scale-105 transition-transform duration-200">
              <HotelIcon className="w-4 h-4" />
            </div>
            <div className="flex items-center">
              <span className="text-base sm:text-lg font-bold text-slate-950 tracking-tight font-heading group-hover:text-red-600 transition-colors">
                Cobalt<span className="text-red-600">Hotels</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 border border-red-200 text-red-700 rounded-full">
                Luxury
              </span>
            </div>
          </Link>

          {/* Navigation Links Pill */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/70 text-xs font-semibold">
            <Link
              href="/"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                pathname === "/"
                  ? "bg-white text-slate-950 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
              }`}
            >
              Explore Stays
            </Link>

            <Link
              href="/register-hotel"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 ${
                pathname === "/register-hotel"
                  ? "bg-white text-slate-950 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
              }`}
            >
              <Sparkles className="w-3 h-3 text-red-500" />
              <span>List Property</span>
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  pathname.startsWith("/admin")
                    ? "bg-red-600 text-white font-bold shadow-xs"
                    : "text-red-700 bg-red-50/80 hover:bg-red-100 font-bold"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            {user?.role === "hotel_owner" && (
              <Link
                href="/owner/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  pathname.startsWith("/owner")
                    ? "bg-red-600 text-white font-bold shadow-xs"
                    : "text-red-700 bg-red-50/80 hover:bg-red-100 font-bold"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Owner Portal</span>
              </Link>
            )}
          </nav>

          {/* Right Actions: Notifications & High-Visibility CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
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
                  <div className="absolute right-0 mt-3 w-80 rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 z-50 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                      <span className="text-xs font-bold text-slate-950 font-heading">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-red-600 hover:text-red-700 font-bold"
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
                            className={`block p-3 rounded-2xl border transition ${
                              !n.read
                                ? "bg-red-50/70 border-red-200 text-slate-900"
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

            {/* Logged In User Pill or Auth Action Buttons */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={user.role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-lava-primary to-lava-orange text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-bold text-slate-950">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button
                    className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200"
                  >
                    <UserIcon className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                    <span>Sign In</span>
                  </button>
                </Link>
                <Link href="/register-hotel">
                  <button
                    className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-lava-primary via-lava-orange to-red-600 hover:opacity-95 text-white shadow-md shadow-red-500/25 hover:scale-105 transition-all duration-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-200" />
                    <span>List Hotel</span>
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-2 border-t border-slate-100 mt-3 animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              Explore Stays
            </Link>
            <Link
              href="/register-hotel"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              List Your Hotel (Onboarding)
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50"
              >
                Admin Command Center
              </Link>
            )}
            {user?.role === "hotel_owner" && (
              <Link
                href="/owner/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50"
              >
                Hotel Owner Portal
              </Link>
            )}
          </div>
        )}
      </header>
    </div>
  );
}
