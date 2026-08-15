"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SplitAuthLayout } from "@/components/auth/split-auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Building2, AlertCircle, Sparkles, Key } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        setErrorMessage(data.error?.message || "Invalid credentials provided");
      }
    } catch {
      setErrorMessage("Network error during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: "password123" }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/owner/dashboard");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SplitAuthLayout
      imageUrl="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop&q=90"
      imageAlt="Cobalt Hotels Luxury Suites"
      badgeText="Enterprise Hotel Control Plane"
      quote="The platform gave our property management team complete transparency over room reservations, cleaning dispatches, and guest revenue analytics."
      quoteAuthor="Tariq Mahmood"
      quoteRole="Managing Director, Serena Grand Palace"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lava-500/15 border border-lava-500/30 text-lava-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure Portal Access</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-heading">
            Sign In to Platform
          </h1>
          <p className="text-xs text-titanium-400">
            Access your assigned hotel dashboard or administrative console.
          </p>
        </div>

        {/* Form Panel */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@hotelplatform.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              Sign In to Dashboard
            </Button>
          </form>

          {/* 2 Default Accounts */}
          <div className="pt-5 border-t border-lava-800 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-titanium-300 uppercase tracking-wider">
                Default User Accounts
              </p>
              <span className="text-[10px] text-titanium-500 font-mono">Password: password123</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Default User 1: Master Admin */}
              <button
                type="button"
                onClick={() => handleQuickDemo("admin@hotelplatform.com")}
                className="p-3.5 rounded-xl bg-lava-900 border border-lava-800 hover:border-lava-500 text-left transition group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-lava-400 shrink-0" />
                    <span className="font-bold text-white group-hover:text-lava-400">Admin</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-lava-500/20 text-lava-400 font-bold">
                    Role: Admin
                  </span>
                </div>
                <p className="text-[11px] text-titanium-300 font-mono truncate">admin@hotelplatform.com</p>
              </button>

              {/* Default User 2: Hotel Owner */}
              <button
                type="button"
                onClick={() => handleQuickDemo("owner@serenapalace.com")}
                className="p-3.5 rounded-xl bg-lava-900 border border-lava-800 hover:border-emerald-500 text-left transition group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-signal-emerald shrink-0" />
                    <span className="font-bold text-white group-hover:text-emerald-400">Hotel Owner</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    Role: Owner
                  </span>
                </div>
                <p className="text-[11px] text-titanium-300 font-mono truncate">owner@serenapalace.com</p>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-titanium-400">
            Need to register a new property?{" "}
            <Link href="/register-hotel" className="text-lava-400 hover:text-lava-300 font-bold">
              Submit Registration Request (Option 2)
            </Link>
          </div>
        </div>
      </div>
    </SplitAuthLayout>
  );
}
