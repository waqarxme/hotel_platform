"use client";

import React, { useState, useEffect } from "react";
import { CleaningRequest, CleaningTeam } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import {
  Truck,
  Plus,
} from "lucide-react";

export default function AdminCleaningPage() {
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [teams, setTeams] = useState<CleaningTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Assign Team Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Create Team Modal
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    leaderName: "",
    contactPhone: "+92 300 ",
    city: "Islamabad",
  });
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const fetchCleaningData = async () => {
    try {
      const res = await fetch("/api/admin/cleaning-teams");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        setTeams(data.teams || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaningData();
  }, []);

  const handleOpenAssign = (requestId: string) => {
    setSelectedRequestId(requestId);
    if (teams.length > 0) setSelectedTeamId(teams[0].id);
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !selectedTeamId) return;

    setIsAssigning(true);
    try {
      const res = await fetch("/api/admin/cleaning-teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cleaningRequestId: selectedRequestId,
          teamId: selectedTeamId,
        }),
      });

      if (res.ok) {
        setAssignModalOpen(false);
        fetchCleaningData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingTeam(true);
    try {
      const res = await fetch("/api/admin/cleaning-teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeam),
      });

      if (res.ok) {
        setCreateTeamModalOpen(false);
        setNewTeam({ name: "", leaderName: "", contactPhone: "+92 300 ", city: "Islamabad" });
        fetchCleaningData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading cleaning operations...</div>;
  }

  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 font-heading">
            Cleaning Fleet Operations & Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign specialized cleaning squads to verified hotels earning milestone rewards.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateTeamModalOpen(true)}
          className="gap-2 bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cleaning Team</span>
        </Button>
      </div>

      {/* Cleaning Teams Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-950 font-heading">Available Cleaning Squads ({teams.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-2xl p-5 space-y-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200">
                  <Truck className="w-5 h-5" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {team.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-950">{team.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Leader: {team.leaderName} • {team.city}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">{team.contactPhone}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Active Assignments:</span>
                <span className="font-mono font-bold text-slate-950">{team.activeAssignments}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hotel Cleaning Requests Queue */}
      <div className="bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-950 font-heading">Hotel Cleaning Requests</h2>

        {requests.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No pending cleaning requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Hotel Name</th>
                  <th className="px-4 py-3">Rooms / Scope</th>
                  <th className="px-4 py-3">Target Date</th>
                  <th className="px-4 py-3">Assigned Team</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5 font-bold text-slate-950">{r.hotelName}</td>
                    <td className="px-4 py-3.5 text-slate-700">{r.roomNumbers}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">{formatDate(r.requestedDate)}</td>
                    <td className="px-4 py-3.5">
                      {r.assignedTeamName ? (
                        <span className="text-slate-900 font-semibold">{r.assignedTeamName}</span>
                      ) : (
                        <span className="text-amber-600 font-medium italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === "assigned"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {r.status === "pending" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenAssign(r.id)}
                          className="gap-1 bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Assign Squad</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Squad Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Cleaning Team"
        description="Select a certified squad to service the requested property."
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <Select
            label="Select Cleaning Team *"
            options={teams.map((t) => ({ label: `${t.name} (${t.city})`, value: t.id }))}
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isAssigning} className="bg-slate-900 text-white">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Team Modal */}
      <Modal
        isOpen={createTeamModalOpen}
        onClose={() => setCreateTeamModalOpen(false)}
        title="Register New Cleaning Squad"
        description="Add a regional cleaning team available for platform dispatch."
      >
        <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
          <Input
            label="Squad / Company Name *"
            placeholder="e.g. Apex Hospitality Cleaners"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            required
          />
          <Input
            label="Squad Leader Name *"
            placeholder="e.g. Tariq Mehmood"
            value={newTeam.leaderName}
            onChange={(e) => setNewTeam({ ...newTeam, leaderName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone *"
              value={newTeam.contactPhone}
              onChange={(e) => setNewTeam({ ...newTeam, contactPhone: e.target.value })}
              required
            />
            <Input
              label="Operational City *"
              value={newTeam.city}
              onChange={(e) => setNewTeam({ ...newTeam, city: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreatingTeam} className="bg-slate-900 text-white">
              Register Squad
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
