"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Star,
  Sparkles,
  Lock,
  Mail,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [shake, setShake] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/owner/dashboard");
        }
      } else {
        setErrorMessage(data.error?.message || "Invalid credentials. Please try again.");
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setErrorMessage("Network error. Please check your connection.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/owner/dashboard");
        }
      } else {
        setErrorMessage(data.error?.message || "Login failed.");
      }
    } catch {
      setErrorMessage("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#080C14]">
      {/* ── LEFT CINEMATIC PANEL (7 cols) ── */}
      <div className="hidden lg:flex lg:col-span-7 relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1800&auto=format&fit=crop&q=90"
            alt="AuraHotels Luxury Suite"
            className="w-full h-full object-cover brightness-[0.45] scale-105"
          />
          {/* Multi-layer gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080C14]/95 via-[#080C14]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C14]/80 via-transparent to-[#080C14]/30" />
        </div>

        {/* Decorative floating orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-red-600/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-orange-500/6 blur-3xl pointer-events-none" />

        {/* TOP: Brand */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div
              className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-red-500/60 shadow-lg shadow-red-500/20 group-hover:border-red-400 transition"
              style={{ background: "linear-gradient(135deg, #FF3B30, #FF9500)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/brand-logo.jpg" alt="AuraHotels" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white font-heading tracking-tight group-hover:text-red-400 transition">
                Aura<span className="text-red-500">Hotels</span>
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">
                Luxury Hospitality Platform
              </p>
            </div>
          </Link>
        </div>

        {/* BOTTOM: Quote + Trust Badges */}
        <div className="relative z-10 space-y-8 max-w-xl">
          {/* Floating trust pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/8 border border-white/12 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-slate-200 font-semibold tracking-wide">
              Secure Admin &amp; Partner Portal
            </span>
          </div>

          {/* Main testimonial */}
          <blockquote className="space-y-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
              ))}
            </div>
            <p className="text-xl xl:text-2xl font-medium text-white leading-relaxed font-heading">
              &ldquo;The platform gave our property management team complete transparency over room reservations, cleaning dispatches, and guest revenue analytics.&rdquo;
            </p>
            <footer className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                  alt="Tariq Mahmood"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Tariq Mahmood</span>
                <span className="text-xs text-slate-400">Managing Director, Serena Grand Palace</span>
              </div>
            </footer>
          </blockquote>

          {/* Trust Badges row */}
          <div className="flex items-center gap-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Properties Only</span>
            </div>
            <div className="w-px h-4 bg-white/15" />
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>Free Cleaning Program</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL (5 cols) ── */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-10 xl:px-14 py-12 bg-[#0D111C] relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-600/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-orange-500/4 blur-3xl pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-red-500/50" style={{ background: "linear-gradient(135deg, #FF3B30, #FF9500)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand-logo.jpg" alt="AuraHotels" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-extrabold text-white font-heading">
            Aura<span className="text-red-500">Hotels</span>
          </span>
        </div>

        <div className="w-full max-w-md mx-auto space-y-7 relative z-10">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure Portal Access</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white font-heading mt-2">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sign in to your assigned hotel dashboard or the administrative console.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              className={`p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-red-300 text-sm font-medium ${
                shake ? "animate-[shake_0.5s_ease-in-out]" : ""
              }`}
              style={
                shake
                  ? { animation: "shake 0.5s ease-in-out" }
                  : {}
              }
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-red-500/60 focus:bg-white/8 focus:ring-2 focus:ring-red-500/15 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-red-500/60 focus:bg-white/8 focus:ring-2 focus:ring-red-500/15 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ background: isLoading ? "#374151" : "linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)" }}
              className="w-full py-4 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-red-500/20 hover:opacity-90 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Cards */}
          <div className="space-y-3 pt-2 border-t border-white/8">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Quick Access</p>
              <span className="text-[10px] text-slate-600 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/8">
                Pass: password123
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Admin card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@hotelplatform.com", "password123")}
                disabled={isLoading}
                className="p-4 rounded-2xl bg-white/4 border border-white/8 hover:border-red-500/30 hover:bg-white/7 text-left transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-red-500/15 border border-red-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400 font-bold border border-red-500/20">
                    Admin
                  </span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-red-400 transition">Master Admin</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">admin@hotelplatform.com</p>
              </button>

              {/* Owner card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("owner@serenapalace.com", "password123")}
                disabled={isLoading}
                className="p-4 rounded-2xl bg-white/4 border border-white/8 hover:border-emerald-500/30 hover:bg-white/7 text-left transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                    Owner
                  </span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Hotel Owner</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">owner@serenapalace.com</p>
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-600">
            Want to list your property?{" "}
            <Link href="/register-hotel" className="text-red-400 hover:text-red-300 font-bold transition">
              Submit Registration
            </Link>
          </p>
        </div>
      </div>

      {/* Shake animation CSS */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
