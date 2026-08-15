"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Hotel, HotelStatus } from "@/types";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PulseStatusBadge } from "@/components/ui/pulse-badge";
import { formatDate } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Search,
  PlusCircle,
  Eye,
  Building2,
} from "lucide-react";

export default function AdminHotelsPage() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") as HotelStatus | "all") || "pending_approval";

  const [activeTab, setActiveTab] = useState<string>(initialStatus);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (activeTab !== "all") query.append("status", activeTab);
      if (search) query.append("search", search);

      const res = await fetch(`/api/admin/hotels?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHotels(data.hotels || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHotels();
  };

  const tabs = [
    {
      id: "pending_approval",
      label: "Pending Requests",
      count: counts.pending,
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      id: "approved",
      label: "Approved Hotels",
      count: counts.approved,
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      id: "rejected",
      label: "Rejected Hotels",
      count: counts.rejected,
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
    {
      id: "suspended",
      label: "Suspended Hotels",
      count: counts.suspended,
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
    },
    {
      id: "all",
      label: "All Properties",
      count: counts.all,
      icon: <Building2 className="w-3.5 h-3.5 text-slate-400" />,
    },
  ];

  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 font-heading">Hotel Management Queues</h1>
          <p className="text-xs text-slate-500 mt-1">
            Section 4 Admin Queues: Review applications, approve or reject, and suspend properties.
          </p>
        </div>

        <Link href="/admin/hotels/create">
          <Button
            variant="primary"
            size="sm"
            className="gap-2 bg-gradient-to-r from-lava-primary via-lava-orange to-red-600 text-white font-bold shadow-md shadow-red-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Hotel Profile (Option 1)</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id)} />

      {/* Search Input */}
      <form onSubmit={handleSearch} className="bg-white border border-slate-200 shadow-xs rounded-2xl p-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search hotel name, city, owner legal business name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-xs text-slate-900 placeholder-slate-400 w-full focus:outline-none font-medium"
        />
        <Button type="submit" variant="secondary" size="sm" className="bg-slate-100 text-slate-800 hover:bg-slate-200">
          Search
        </Button>
      </form>

      {/* Hotels Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading hotels...</div>
        ) : hotels.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No hotels found in this queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Hotel Property</th>
                  <th className="px-5 py-3.5">Owner & Legal Entity</th>
                  <th className="px-5 py-3.5">Category & Rooms</th>
                  <th className="px-5 py-3.5">Submission Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hotels.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 text-sm">{h.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {h.city}, {h.country}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{h.businessName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{h.email}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px]">
                        {h.category}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{h.totalRooms} Rooms</p>
                    </td>

                    <td className="px-5 py-4 text-slate-500 font-mono">{formatDate(h.createdAt)}</td>

                    <td className="px-5 py-4">
                      <PulseStatusBadge status={h.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/hotels/${h.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="gap-1.5 bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review & Manage</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
