import React from "react";
import Link from "next/link";
import { Hotel, Shield, CheckCircle2, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-lava-800/80 bg-lava-950 py-12 text-titanium-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-lava-500 text-white shadow-sm shadow-lava-500/30">
                <Hotel className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white font-heading">
                Cobalt<span className="text-lava-500">Hotels</span>
              </span>
            </div>
            <p className="text-titanium-400 text-xs max-w-md leading-relaxed">
              Enterprise Hotel Onboarding & Approval Platform. Streamlining verification, direct bookings, cleaning fleet operations, and hospitality revenue analytics.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-titanium-500 pt-2">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-signal-emerald" /> Supabase RLS Protected
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-lava-400" /> Vercel Serverless Ready
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              For Hotel Owners
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register-hotel" className="hover:text-white transition">
                  List Your Property (Option 2)
                </Link>
              </li>
              <li>
                <Link href="/owner/dashboard" className="hover:text-white transition">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/owner/cleaning" className="hover:text-white transition">
                  Free Cleaning Program
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Owner Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Administration
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin/dashboard" className="hover:text-white transition">
                  Admin Command Console
                </Link>
              </li>
              <li>
                <Link href="/admin/hotels" className="hover:text-white transition">
                  Approval Queue (4 Queues)
                </Link>
              </li>
              <li>
                <Link href="/admin/hotels/create" className="hover:text-white transition">
                  Add Hotel Directly (Option 1)
                </Link>
              </li>
              <li>
                <Link href="/admin/cleaning" className="hover:text-white transition">
                  Cleaning Team Dispatch
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-lava-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-titanium-500">
          <p>© 2026 Cobalt Hotels Platform. All rights reserved.</p>
          <p>Powered by Supabase RLS & Vercel Serverless Architecture</p>
        </div>
      </div>
    </footer>
  );
}
