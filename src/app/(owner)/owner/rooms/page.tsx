"use client";

import React, { useState, useEffect } from "react";
import { Room } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ImageUpload } from "@/components/ui/image-upload";
import { formatCurrency } from "@/lib/utils";
import {
  BedDouble,
  Plus,
  Trash2,
  Edit2,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function OwnerRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Create/Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "Deluxe",
    pricePerNight: 180,
    capacity: 2,
    totalUnits: 5,
    description: "",
    photos: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"],
    amenities: ["Free Wi-Fi", "Air Conditioning", "King Bed"],
    isActive: true,
  });

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      } else {
        const data = await res.json();
        setErrorMessage(data.error?.message || "Failed to load rooms");
      }
    } catch {
      setErrorMessage("Network error loading rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openCreateModal = () => {
    setEditingRoomId(null);
    setFormData({
      name: "",
      type: "Deluxe",
      pricePerNight: 180,
      capacity: 2,
      totalUnits: 5,
      description: "",
      photos: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"],
      amenities: ["Free Wi-Fi", "Air Conditioning", "King Bed"],
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoomId(room.id);
    setFormData({
      name: room.name,
      type: room.type,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      totalUnits: room.totalUnits,
      description: room.description,
      photos: room.photos || [],
      amenities: room.amenities || [],
      isActive: room.isActive,
    });
    setModalOpen(true);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter((a) => a !== amenity) : [...prev.amenities, amenity],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingRoomId) {
        // Edit Room
        const res = await fetch("/api/rooms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingRoomId, ...formData }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchRooms();
        }
      } else {
        // Create Room
        const res = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchRooms();
        }
      }
    } catch {
      console.error("Save error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this room category?")) return;
    try {
      const res = await fetch(`/api/rooms?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRooms();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold mb-2">
            <BedDouble className="w-3.5 h-3.5" />
            <span>Room Category & Inventory Management</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-950 font-heading">Rooms & Pricing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure room types, night rates, bed capacities, amenities, and available inventory.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          className="gap-2 shrink-0 bg-gradient-to-r from-lava-primary via-lava-orange to-red-600 text-white font-bold shadow-md shadow-red-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room Category</span>
        </Button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200 shadow-sm">
          <BedDouble className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-heading">No Room Categories Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add room categories to publish them on the public portal and start accepting reservations.
          </p>
          <Button variant="primary" size="sm" onClick={openCreateModal} className="bg-slate-900 text-white">
            Add First Room
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {room.photos && room.photos.length > 0 && (
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={room.photos[0]}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/95 text-slate-900 border border-slate-200 shadow-xs">
                    {room.type}
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-950 font-heading">{room.name}</h3>
                    <span className="flex items-center gap-1 text-xs text-slate-600 font-semibold">
                      <Users className="w-3.5 h-3.5 text-red-600" /> Max {room.capacity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{room.description}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {room.amenities.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700"
                      >
                        {a}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-500">
                        +{room.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Price per night</span>
                    <p className="text-lg font-bold text-slate-950 font-mono">{formatCurrency(room.pricePerNight)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(room)}
                      className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-950 transition"
                      title="Edit Room Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition"
                      title="Delete Room Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoomId ? "Edit Room Category" : "Add New Room Category"}
        description="Define suite specifications, pricing per night, and capacity."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Room Category Name *"
            placeholder="e.g. Royal Executive Mountain Suite"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Room Type"
              options={[
                { label: "Standard", value: "Standard" },
                { label: "Deluxe", value: "Deluxe" },
                { label: "Executive Suite", value: "Executive Suite" },
                { label: "Presidential Penthouse", value: "Presidential Penthouse" },
                { label: "Family Villa", value: "Family Villa" },
              ]}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />
            <Input
              label="Price Per Night ($) *"
              type="number"
              min={10}
              value={formData.pricePerNight}
              onChange={(e) => setFormData({ ...formData, pricePerNight: parseFloat(e.target.value) || 100 })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Max Guest Capacity *"
              type="number"
              min={1}
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 2 })}
              required
            />
            <Input
              label="Total Available Units *"
              type="number"
              min={1}
              value={formData.totalUnits}
              onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <TextArea
            label="Room Description *"
            rows={2}
            placeholder="Details on bed layout, private bath, balcony views, smart features..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <ImageUpload
            label="Room Photo"
            value={formData.photos[0] || ""}
            onChange={(url) => setFormData({ ...formData, photos: [url] })}
          />

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Room Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {["Free Wi-Fi", "Air Conditioning", "King Bed", "Mini Bar", "Balcony View", "Smart TV"].map(
                (amenity) => {
                  const isSelected = formData.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-2 rounded-lg border text-xs font-medium text-left flex items-center gap-1.5 transition ${
                        isSelected
                          ? "bg-red-50 border-red-500 text-red-700 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${isSelected ? "text-red-600" : "text-slate-400"}`}
                      />
                      <span className="truncate">{amenity}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              className="bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold"
            >
              {editingRoomId ? "Save Changes" : "Create Room Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
