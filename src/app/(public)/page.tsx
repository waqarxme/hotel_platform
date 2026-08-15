"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Hotel } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Calendar,
  Users,
  Star,
  Award,
  Zap,
  TrendingUp,
  Percent,
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
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-lava-800/80">
        {/* Background 4K Architecture Image with Volcanic Lava Glow */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&auto=format&fit=crop&q=90"
            alt="Luxury Hotel Resort Panoramic"
            className="w-full h-full object-cover brightness-[0.28] contrast-[1.2] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lava-950/80 via-lava-950/90 to-lava-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-lava-500/25 via-lava-600/10 to-transparent blur-3xl pointer-events-none" />
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-lava-500/20 border border-lava-500/40 text-lava-300 text-xs font-bold backdrop-blur-md shadow-lg shadow-lava-500/15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lava-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lava-500" />
            </span>
            <span>Enterprise Hospitality Infrastructure & Verified Bookings</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-heading leading-[1.1]">
            Experience Verified Stays & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-lava-400 via-lava-200 to-white bg-clip-text text-transparent drop-shadow-sm">
              Automated Property Management
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-titanium-200 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-normal">
            Direct reservation control for premium travelers. Automated administrative onboarding, instant room availability management, and complimentary cleaning fleet dispatch for hotel partners.
          </p>

          {/* Advanced Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-4xl mx-auto p-3 bg-lava-900/95 rounded-2xl border border-lava-700/90 shadow-2xl shadow-black flex flex-col md:flex-row items-center gap-3 backdrop-blur-xl"
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full border-b md:border-b-0 md:border-r border-lava-800">
              <MapPin className="w-5 h-5 text-lava-400 shrink-0" />
              <div className="text-left w-full">
                <span className="block text-[10px] uppercase font-bold text-titanium-400 tracking-wider">Destination</span>
                <input
                  type="text"
                  placeholder="Where are you going? (e.g. Islamabad, Lahore, Naran)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-titanium-500 focus:outline-none font-medium mt-0.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 w-full md:w-56 border-b md:border-b-0 md:border-r border-lava-800">
              <Calendar className="w-5 h-5 text-lava-400 shrink-0" />
              <div className="text-left">
                <span className="block text-[10px] uppercase font-bold text-titanium-400 tracking-wider">Dates</span>
                <p className="text-xs text-white font-semibold mt-0.5">Flexible • 2026 Season</p>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto px-8 shrink-0">
              <Search className="w-4 h-4 mr-2" />
              <span>Explore Stays</span>
            </Button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition duration-200 capitalize ${
                  category === cat
                    ? "bg-lava-500 text-white shadow-lg shadow-lava-500/30 scale-105"
                    : "bg-lava-900/80 border border-lava-800 text-titanium-300 hover:text-white hover:border-lava-500/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stats Ticker */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-lava-800/80 text-center">
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-white font-heading">100%</p>
              <p className="text-[11px] text-titanium-400 font-medium uppercase tracking-wider">Admin Verified</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-lava-400 font-heading">1 in 5</p>
              <p className="text-[11px] text-titanium-400 font-medium uppercase tracking-wider">Free Cleanings Earned</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-white font-heading">0 Sec</p>
              <p className="text-[11px] text-titanium-400 font-medium uppercase tracking-wider">Instant Confirmation</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-signal-emerald font-heading">24/7</p>
              <p className="text-[11px] text-titanium-400 font-medium uppercase tracking-wider">Fleet Dispatch</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AVAILABLE PROPERTIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lava-500/15 text-lava-400 border border-lava-500/30 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Partner Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading">
              Featured Verified Stays ({hotels.length})
            </h2>
            <p className="text-xs sm:text-sm text-titanium-400 mt-1">
              Properties officially inspected and ready for instant reservation confirmations.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-lava-900/50 border border-lava-800 animate-pulse" />
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center space-y-4">
            <Building2 className="w-12 h-12 text-titanium-500 mx-auto" />
            <h3 className="text-xl font-bold text-white font-heading">No properties found</h3>
            <p className="text-xs text-titanium-400">Try adjusting your destination keyword or filter category.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="glass-card rounded-3xl overflow-hidden border border-lava-800/80 hover:border-lava-500/70 transition-all duration-300 flex flex-col group shadow-2xl hover:shadow-lava-500/10"
              >
                {/* Image */}
                <div className="relative h-60 w-full overflow-hidden bg-lava-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      hotel.coverImageUrl ||
                      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80"
                    }
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.9]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-lava-950 via-transparent to-transparent opacity-90" />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Badge variant="lava" size="sm">
                      {hotel.category}
                    </Badge>
                    {hotel.isVerified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" /> Verified Partner
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5 text-xs text-titanium-200 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-lava-400" />
                      <span>{hotel.city}, {hotel.country}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-lava-400 transition font-heading line-clamp-1">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-titanium-300 line-clamp-2 leading-relaxed">
                      {hotel.description}
                    </p>

                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {hotel.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="px-2.5 py-0.5 rounded-md bg-lava-950 border border-lava-800 text-[10px] text-titanium-300 font-medium"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-lava-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-titanium-400 uppercase font-bold">Starting from</span>
                      <p className="text-xl font-bold text-white font-mono">
                        {formatCurrency(hotel.startingPrice)}
                        <span className="text-xs text-titanium-400 font-sans font-normal"> / night</span>
                      </p>
                    </div>

                    <Link href={`/hotels/${hotel.id}`}>
                      <Button variant="primary" size="sm" className="gap-2">
                        <span>Book Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
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
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-lava-800/90 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Info */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lava-500/20 border border-lava-500/40 text-lava-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-lava-400" />
                <span>Zero-Commission Hotel Milestone Rewards</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading leading-tight">
                Calculate Your Free Professional Cleaning Quota
              </h2>
              <p className="text-xs sm:text-sm text-titanium-300 leading-relaxed">
                For every <strong>5 completed guest reservations</strong> on the platform, our certified regional hygiene squads perform a full complimentary deep cleaning for your property suites.
              </p>

              <div className="space-y-4 pt-3">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Monthly Guest Bookings:</span>
                  <span className="text-base font-bold text-lava-400 font-mono">{monthlyBookings} Bookings</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={monthlyBookings}
                  onChange={(e) => setMonthlyBookings(parseInt(e.target.value))}
                  className="w-full h-2 bg-lava-900 rounded-lg appearance-none cursor-pointer accent-lava-500"
                />
              </div>
            </div>

            {/* Right: Milestone Output Card */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-lava-950 border border-lava-800 text-center space-y-2">
                <Award className="w-8 h-8 text-lava-400 mx-auto" />
                <p className="text-3xl sm:text-4xl font-bold text-white font-heading">{freeCleaningsEarned}</p>
                <p className="text-xs text-titanium-400 uppercase font-bold">Free Cleanings / Mo</p>
              </div>

              <div className="p-6 rounded-2xl bg-lava-950 border border-lava-800 text-center space-y-2">
                <TrendingUp className="w-8 h-8 text-signal-emerald mx-auto" />
                <p className="text-3xl sm:text-4xl font-bold text-signal-emerald font-mono">{formatCurrency(estimatedSavings)}</p>
                <p className="text-xs text-titanium-400 uppercase font-bold">Annual Fleet Value</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PARTNER ONBOARDING CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-lava-900 via-lava-850 to-lava-950 border border-lava-700/80 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lava-500/20 border border-lava-500/40 text-lava-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-lava-400" />
              <span>Partner Onboarding Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white font-heading leading-tight">
              Ready to List Your Property?
            </h2>
            <p className="text-titanium-200 text-xs sm:text-sm leading-relaxed">
              Join the Cobalt hospitality ecosystem. Complete your registration in 3 simple steps, upload your license for instant verification, and unlock your dedicated property dashboard.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link href="/register-hotel">
                <Button variant="primary" size="lg" className="shadow-2xl shadow-lava-500/40">
                  Register Your Hotel (Option 2)
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Access Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
