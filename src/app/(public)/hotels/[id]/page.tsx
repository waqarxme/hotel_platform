"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Hotel, Room, Review } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input, TextArea } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MapPin,
  Star,
  Users,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal State
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkInDate: "2026-08-20",
    checkOutDate: "2026-08-23",
    guestsCount: 2,
  });

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    guestName: "",
    guestEmail: "",
    rating: 5,
    comment: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchHotelData = async () => {
    try {
      const res = await fetch(`/api/hotels/${hotelId}`);
      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
        setRooms(data.rooms || []);
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelData();
  }, [hotelId]);

  const handleOpenBooking = (room: Room) => {
    setSelectedRoom(room);
    setBookingSuccess(false);
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !hotel) return;

    setBookingLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: hotel.id,
          roomId: selectedRoom.id,
          ...bookingForm,
        }),
      });

      if (res.ok) {
        setBookingSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: hotel.id,
          ...reviewForm,
        }),
      });

      if (res.ok) {
        setReviewForm({ guestName: "", guestEmail: "", rating: 5, comment: "" });
        fetchHotelData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading hotel property...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Hotel Not Found</h2>
        <p className="text-slate-500 text-sm">This hotel may be unapproved or suspended.</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Return to Explorer
        </Button>
      </div>
    );
  }

  const allPhotos = [
    hotel.coverImageUrl,
    ...(hotel.galleryImages || []),
    ...(rooms.flatMap((r) => r.photos || [])),
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-slate-900">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-sm">
                {hotel.category}
              </span>
              {hotel.isVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Partner Property
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 font-heading">{hotel.name}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                {hotel.address}, {hotel.city}, {hotel.country}
              </span>
              {hotel.googleMapsUrl && (
                <a
                  href={hotel.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 ml-2 font-semibold"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Capacity</p>
            <p className="text-2xl font-bold text-slate-900 font-heading">{hotel.totalRooms} Rooms</p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 rounded-3xl overflow-hidden max-h-[480px]">
          <div className="md:col-span-2 relative h-80 md:h-[480px] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allPhotos[0] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200"}
              alt="Cover view"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-3.5 h-[480px]">
            <div className="relative h-full bg-slate-100 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={allPhotos[1] || allPhotos[0]}
                alt="Gallery 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative h-full bg-slate-100 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={allPhotos[2] || allPhotos[0]}
                alt="Gallery 2"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description & Amenities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950 font-heading">About This Property</h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {hotel.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950 font-heading">Featured Hotel Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hotel.amenities && hotel.amenities.length > 0 ? (
                hotel.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 col-span-3">Standard hospitality amenities included.</p>
              )}
            </div>
          </div>
        </div>

        {/* Property Highlights */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-200 shadow-sm border-l-4 border-l-red-600">
            <h3 className="text-base font-bold text-slate-950 font-heading">Guest Protection & Assurance</h3>
            <ul className="space-y-3.5 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Instant reservation confirmed directly with property management</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Free cancellation up to 48 hours before check-in date</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Complimentary room sanitization by certified regional squads</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Available Room Categories */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-950 font-heading">Available Room Categories</h2>
        {rooms.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs shadow-sm">
            No rooms published yet by this hotel.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                {room.photos && room.photos.length > 0 && (
                  <div className="relative h-48 w-full bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={room.photos[0]} alt={room.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/95 text-slate-900 border border-slate-200 shadow-xs">
                      {room.type}
                    </span>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-950 font-heading">{room.name}</h4>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="w-3.5 h-3.5 text-red-600" /> Max {room.capacity} Guests
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{room.description}</p>

                    {room.amenities && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {room.amenities.map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[10px] text-slate-700 rounded-md"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Nightly Rate</span>
                      <p className="text-xl font-bold text-slate-900 font-mono">
                        {formatCurrency(room.pricePerNight)}
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenBooking(room)}
                      className="bg-gradient-to-r from-lava-primary via-lava-orange to-red-600 text-white font-bold"
                    >
                      Reserve Room
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews Section */}
      <section className="space-y-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 font-heading">
              Guest Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-slate-500 mt-1">Verified reviews from past guests</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500">Be the first to review this property!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-950">{rev.guestName}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {rev.response && (
                    <div className="mt-3 p-3.5 rounded-xl bg-red-50/50 border-l-2 border-red-600 space-y-1">
                      <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
                        Response from Property Manager
                      </p>
                      <p className="text-xs text-slate-700">{rev.response}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Submit Review Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 h-fit shadow-xs">
            <h3 className="text-sm font-bold text-slate-950 font-heading">Leave a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3.5">
              <Input
                label="Your Name"
                placeholder="Full name"
                value={reviewForm.guestName}
                onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={reviewForm.guestEmail}
                onChange={(e) => setReviewForm({ ...reviewForm, guestEmail: e.target.value })}
                required
              />
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`p-1 text-lg ${
                        reviewForm.rating >= star ? "text-amber-500" : "text-slate-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <TextArea
                label="Your Feedback"
                rows={3}
                placeholder="Share your stay experience..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={reviewSubmitting}
                className="w-full bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold"
              >
                Submit Review
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={bookingSuccess ? "Booking Confirmed! 🎉" : `Book: ${selectedRoom?.name}`}
        description={
          bookingSuccess
            ? "Your reservation has been received and verified."
            : `${hotel.name} — ${selectedRoom?.type}`
        }
      >
        {bookingSuccess ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-700">
              Thank you, <strong>{bookingForm.guestName}</strong>! Your reservation has been sent directly to the hotel management team.
            </p>
            <Button variant="primary" size="sm" onClick={() => setBookingModalOpen(false)} className="bg-slate-900 text-white">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={bookingForm.guestName}
                onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                placeholder="John Doe"
                required
              />
              <Input
                label="Email"
                type="email"
                value={bookingForm.guestEmail}
                onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Phone Number"
                value={bookingForm.guestPhone}
                onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                placeholder="+92 300 1234567"
                required
              />
              <Input
                label="Check-In Date"
                type="date"
                value={bookingForm.checkInDate}
                onChange={(e) => setBookingForm({ ...bookingForm, checkInDate: e.target.value })}
                required
              />
              <Input
                label="Check-Out Date"
                type="date"
                value={bookingForm.checkOutDate}
                onChange={(e) => setBookingForm({ ...bookingForm, checkOutDate: e.target.value })}
                required
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Nightly rate:</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {selectedRoom ? formatCurrency(selectedRoom.pricePerNight) : "$0"}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={bookingLoading}
                className="bg-gradient-to-r from-lava-primary to-lava-orange text-white font-bold"
              >
                Confirm Reservation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
