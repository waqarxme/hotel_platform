"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Hotel, Notification } from "@/types";
import {
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
      {/* Floating Pill Header Container */}
      <header className="max-w-6xl mx-auto rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-xl shadow-slate-900/10 px-4 sm:px-6 py-2.5 transition-all duration-300">
        <div className="flex items-center justify-between">
          {/* Brand Logo with Generated Emblem */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-red-500 shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform duration-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brand-logo.jpg"
                alt="AuraHotels Logo"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight font-heading group-hover:text-red-600 transition-colors">
                Aura<span className="text-red-600">Hotels</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-red-600 text-white rounded-full shadow-xs">
                Luxury
              </span>
            </div>
          </Link>

          {/* Navigation Links Capsule */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-bold">
            <Link
              href="/"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                pathname === "/"
                  ? "bg-white text-slate-950 font-extrabold shadow-sm border border-slate-300"
                  : "text-slate-700 hover:text-slate-950 hover:bg-white/70"
              }`}
            >
              Explore Hotels
            </Link>

            <Link
              href="/register-hotel"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 ${
                pathname === "/register-hotel"
                  ? "bg-white text-slate-950 font-extrabold shadow-sm border border-slate-300"
                  : "text-slate-700 hover:text-slate-950 hover:bg-white/70"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>List Property</span>
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  pathname.startsWith("/admin")
                    ? "bg-red-600 text-white font-extrabold shadow-xs"
                    : "text-red-700 bg-red-50 hover:bg-red-100 font-extrabold"
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
                    ? "bg-red-600 text-white font-extrabold shadow-xs"
                    : "text-red-700 bg-red-50 hover:bg-red-100 font-extrabold"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Owner Portal</span>
              </Link>
            )}
          </nav>

          {/* Right Action Buttons: High-Contrast "Sign In" & "Register Now" */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell for Logged In User */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 transition-colors shadow-xs"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-800" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-sm">
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

            {/* If Logged In, Show User Badge; If Not, Show High-Contrast CTAs */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-bold text-slate-950">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* 1. SIGN IN BUTTON: Crisp Solid Dark Pill */}
                <Link href="/login">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-[#0B0F19] hover:bg-slate-800 text-white shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: "#0B0F19", color: "#FFFFFF" }}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-white" />
                    <span>Sign In</span>
                  </button>
                </Link>

                {/* 2. REGISTER NOW BUTTON: Radiant Solid Lava Red Pill */}
                <Link href="/register-hotel">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-xs font-extrabold text-white shadow-lg shadow-red-500/30 hover:opacity-95 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)",
                      color: "#FFFFFF",
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Register Now</span>
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200"
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
              className="block px-4 py-2.5 rounded-2xl text-xs font-extrabold text-slate-900 hover:bg-slate-100"
            >
              Explore Hotels
            </Link>
            <Link
              href="/register-hotel"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-red-600 to-orange-500 shadow-sm"
            >
              Register Now (Option 2 Onboarding)
            </Link>
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-[#0B0F19]"
              >
                Sign In to Portal
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-extrabold text-red-600 bg-red-50"
              >
                Admin Command Center
              </Link>
            )}
            {user?.role === "hotel_owner" && (
              <Link
                href="/owner/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-extrabold text-red-600 bg-red-50"
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
