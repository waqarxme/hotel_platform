import React from "react";
import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-red-500 shadow-sm bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/brand-logo.jpg"
                  alt="AuraHotels Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-base font-bold text-slate-900 font-heading">
                Aura<span className="text-red-600">Hotels</span>
              </span>
            </div>
            <p className="text-slate-500 text-xs max-w-md leading-relaxed">
              Next-Generation Global Luxury Hotel Booking & Property Workflow Platform. Streamlining verification, direct bookings, cleaning fleet operations, and hospitality revenue analytics.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" /> Supabase RLS Protected
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-red-500" /> Vercel Serverless Ready
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              For Hotel Owners
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register-hotel" className="hover:text-red-600 transition">
                  List Your Property (Option 2)
                </Link>
              </li>
              <li>
                <Link href="/owner/dashboard" className="hover:text-red-600 transition">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/owner/cleaning" className="hover:text-red-600 transition">
                  Free Cleaning Program
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-red-600 transition">
                  Owner Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Administration
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin/dashboard" className="hover:text-red-600 transition">
                  Admin Command Console
                </Link>
              </li>
              <li>
                <Link href="/admin/hotels" className="hover:text-red-600 transition">
                  Approval Queue (4 Queues)
                </Link>
              </li>
              <li>
                <Link href="/admin/hotels/create" className="hover:text-red-600 transition">
                  Add Hotel Directly (Option 1)
                </Link>
              </li>
              <li>
                <Link href="/admin/cleaning" className="hover:text-red-600 transition">
                  Cleaning Team Dispatch
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 AuraHotels Luxury Hospitality Platform. All rights reserved.</p>
          <p>Powered by Supabase RLS & Vercel Serverless Architecture</p>
        </div>
      </div>
    </footer>
  );
}
