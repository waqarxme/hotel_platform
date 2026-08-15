"use client";

import React from "react";
import Link from "next/link";
import { Hotel as HotelIcon, Sparkles, ShieldCheck, Star } from "lucide-react";

export interface SplitAuthLayoutProps {
  children: React.ReactNode;
  imageUrl?: string;
  imageAlt?: string;
  quote?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  badgeText?: string;
}

export function SplitAuthLayout({
  children,
  imageUrl = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop&q=90",
  imageAlt = "Luxury Hotel Resort",
  quote = "The seamless onboarding and automated cleaning fleet rewards have transformed how our boutique suites manage high-season guest bookings.",
  quoteAuthor = "Tariq Mahmood",
  quoteRole = "Managing Director, Serena Grand Palace",
  badgeText = "Cobalt Hospitality Partner Ecosystem",
}: SplitAuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-lava-950">
      {/* LEFT VISUAL HERO PANEL (50% Desktop) */}
      <div className="hidden lg:flex lg:col-span-6 relative overflow-hidden flex-col justify-between p-12 bg-lava-900 border-r border-lava-800/80">
        {/* Background Unsplash Image with Lava Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-cover brightness-[0.7] contrast-[1.1] scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lava-950 via-lava-950/70 to-lava-950/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-lava-500/25 via-transparent to-transparent" />
        </div>

        {/* Top Branding Badge */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="p-2.5 rounded-2xl bg-lava-500 text-white shadow-lg shadow-lava-500/30 group-hover:scale-105 transition duration-200">
              <HotelIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight font-heading group-hover:text-lava-400 transition">
                Cobalt<span className="text-lava-500">Hotels</span>
              </span>
              <p className="text-[10px] text-titanium-400 font-mono tracking-wider uppercase">
                Enterprise Hospitality
              </p>
            </div>
          </Link>
        </div>

        {/* Bottom Testimonial & Trust Badges */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lava-500/20 border border-lava-500/40 text-lava-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-lava-400" />
            <span>{badgeText}</span>
          </div>

          <blockquote className="space-y-3">
            <div className="flex items-center gap-1 text-signal-amber">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-lg font-medium text-white leading-relaxed font-heading">
              &ldquo;{quote}&rdquo;
            </p>
            <footer className="text-xs text-titanium-300">
              <span className="font-bold text-white">{quoteAuthor}</span> — {quoteRole}
            </footer>
          </blockquote>

          <div className="pt-4 border-t border-lava-800/80 flex items-center gap-6 text-xs text-titanium-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-signal-emerald" /> Supabase RLS Protected
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-lava-400" /> Free Cleaning Program
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL (50% Desktop, Full Width on Mobile) */}
      <div className="lg:col-span-6 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-12 relative overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-8">{children}</div>
      </div>
    </div>
  );
}
