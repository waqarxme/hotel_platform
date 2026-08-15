"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Hotel } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const [hotels, setHotels] = useState<(Hotel & { startingPrice: number; roomsCount: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Interactive Cleaning Milestone Calculator State
  const [monthlyBookings, setMonthlyBookings] = useState(25);

  const categories = [
    "all",
    "5 Star",
    "4 Star",
    "Boutique",
    "Resort",
    "Guest House",
    "Apartment",
  ];

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (category !== "all") query.append("category", category);

      const res = await fetch(`/api/hotels/public?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHotels(data.hotels || []);
      }
    } catch (e) {
      console.error("Failed to load hotels", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHotels();
  };

  const freeCleaningsEarned = Math.floor(monthlyBookings / 5);
  const estimatedSavings = freeCleaningsEarned * 120; // $120 per deep cleaning

  return (
    <div className="bg-white min-h-screen space-y-24 pb-24 text-slate-900">
      {/* 1. CINEMATIC FULL-FILL LUXURY HERO SECTION */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        {/* Full-Fill High-Res Luxury Hotel Background Image */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-luxury-hotel.jpg"
            alt="Luxury 5-Star Hotel Resort with Illuminated Infinity Pool"
            className="w-full h-full object-cover object-center scale-105 transform animate-in fade-in duration-1000"
          />
          {/* Ambient Contrast Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/75" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-black/60" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold backdrop-blur-md shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-85" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="tracking-wide">Aura Luxury Hospitality & Verified Global Stays</span>
          </div>

          {/* Bold Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-heading leading-[1.08] drop-shadow-2xl">
            Experience Verified Stays & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Automated Property Operations
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-100 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Direct reservation control for premium travelers. Automated administrative onboarding, instant room availability management, and complimentary cleaning fleet dispatch for hotel partners.
          </p>

          {/* Elevated Pure White Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-4xl mx-auto p-3.5 bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-black/40 flex flex-col md:flex-row items-center gap-3 backdrop-blur-xl"
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full border-b md:border-b-0 md:border-r border-slate-200">
              <MapPin className="w-5 h-5 text-red-600 shrink-0" />
              <div className="text-left w-full">
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Destination</span>
                <input
                  type="text"
                  placeholder="Where are you going? (e.g. Islamabad, Lahore, Naran)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-bold mt-0.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-200">
              <Calendar className="w-5 h-5 text-orange-500 shrink-0" />
              <div className="text-left">
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Dates</span>
                <p className="text-xs text-slate-900 font-bold mt-0.5">Flexible • 2026 Season</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 shrink-0 rounded-2xl bg-gradient-to-r from-lava-primary via-lava-orange to-red-600 hover:opacity-95 text-white font-extrabold shadow-xl shadow-red-500/30 text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Explore Stays</span>
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition duration-200 capitalize backdrop-blur-md cursor-pointer ${
                  category === cat
                    ? "bg-gradient-to-r from-lava-primary to-lava-orange text-white shadow-lg shadow-red-500/40 scale-105 border border-red-400"
                    : "bg-white/90 border border-white/40 text-slate-800 hover:bg-white hover:text-slate-950"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 4 Clean Frosted White Stats Tickers */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-white/20 text-center">
            <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md space-y-0.5">
              <p className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading">100%</p>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Admin Verified</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md space-y-0.5">
              <p className="text-2xl sm:text-3xl font-bold text-red-600 font-heading">1 in 5</p>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Free Cleanings</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md space-y-0.5">
              <p className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading">0 Sec</p>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Instant Booking</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md space-y-0.5">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 font-heading">24/7</p>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Fleet Dispatch</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AVAILABLE PROPERTIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Partner Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 font-heading">
              Featured Verified Stays ({hotels.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Properties officially inspected and ready for instant reservation confirmations.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-100 border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900 font-heading">No properties found</h3>
            <p className="text-xs text-slate-500">Try adjusting your destination keyword or filter category.</p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-red-500 transition-all duration-300 flex flex-col group shadow-md hover:shadow-xl hover:shadow-red-500/10"
              >
                {/* Cover Image */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      hotel.coverImageUrl ||
                      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80"
                    }
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-md border border-slate-100">
                      {hotel.category}
                    </span>
                    {hotel.isVerified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-md">
                        <ShieldCheck className="w-3 h-3" /> Verified Partner
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5 text-xs text-white font-semibold drop-shadow-md">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>{hotel.city}, {hotel.country}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-950 group-hover:text-red-600 transition-colors font-heading line-clamp-1">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {hotel.description}
                    </p>

                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {hotel.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Starting from</span>
                      <p className="text-xl font-bold text-slate-950 font-mono">
                        {formatCurrency(hotel.startingPrice)}
                        <span className="text-xs text-slate-500 font-sans font-normal"> / night</span>
                      </p>
                    </div>

                    <Link href={`/hotels/${hotel.id}`}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-lava-primary via-lava-orange to-red-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
                      >
                        <span>Book Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. INTERACTIVE FREE CLEANING MILESTONE CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200 relative overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Info */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Zero-Commission Hotel Milestone Rewards</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 font-heading leading-tight">
                Calculate Your Free Professional Cleaning Quota
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For every <strong>5 completed guest reservations</strong> on the platform, our certified regional hygiene squads perform a full complimentary deep cleaning for your property suites.
              </p>

              <div className="space-y-4 pt-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span>Monthly Guest Bookings:</span>
                  <span className="text-base font-bold text-red-600 font-mono">{monthlyBookings} Bookings</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={monthlyBookings}
                  onChange={(e) => setMonthlyBookings(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>

            {/* Right: Milestone Output Card */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-sm">
                <Award className="w-8 h-8 text-red-600 mx-auto" />
                <p className="text-3xl sm:text-4xl font-bold text-slate-950 font-heading">{freeCleaningsEarned}</p>
                <p className="text-xs text-slate-500 uppercase font-bold">Free Cleanings / Mo</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-sm">
                <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-3xl sm:text-4xl font-bold text-emerald-600 font-mono">{formatCurrency(estimatedSavings)}</p>
                <p className="text-xs text-slate-500 uppercase font-bold">Annual Fleet Value</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PARTNER ONBOARDING CTA BANNER (Vibrant Lava-Orange Card) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-red-600 via-orange-600 to-red-700 text-white relative overflow-hidden shadow-2xl shadow-red-600/25">
          <div className="max-w-2xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Partner Onboarding Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white font-heading leading-tight drop-shadow-sm">
              Ready to List Your Property on AuraHotels?
            </h2>
            <p className="text-red-50 text-xs sm:text-sm leading-relaxed font-medium">
              Join the Aura luxury hospitality ecosystem. Complete your registration in 3 simple steps, upload your license for instant verification, and unlock your dedicated property dashboard.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link href="/register-hotel">
                <button
                  type="button"
                  className="px-6 py-3 rounded-full text-xs font-extrabold bg-white hover:bg-slate-100 text-red-600 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Register Your Hotel (Option 2)
                </button>
              </Link>
              <Link href="/login">
                <button
                  type="button"
                  className="px-6 py-3 rounded-full text-xs font-extrabold bg-[#0B0F19] hover:bg-slate-900 text-white border border-white/20 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Access Portal
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
