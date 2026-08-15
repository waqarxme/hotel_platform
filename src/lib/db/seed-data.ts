import {
  User,
  Hotel,
  Room,
  Booking,
  CleaningRequest,
  CleaningTeam,
  Review,
  Notification,
} from "@/types";

// TWO DEFAULT USERS (ONE OF EACH ROLE)
export const initialUsers: User[] = [
  {
    id: "usr-admin-1",
    name: "Master Administrator",
    email: "admin@hotelplatform.com",
    role: "admin",
    phone: "+92 300 1234567",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-owner-1",
    name: "Tariq Mahmood",
    email: "owner@serenapalace.com",
    role: "hotel_owner",
    phone: "+92 321 9876543",
    hotelId: "htl-serena-1",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-02-10T10:00:00.000Z",
  },
];

// DEFAULT HOTEL ASSIGNED TO THE HOTEL OWNER
export const initialHotels: Hotel[] = [
  {
    id: "htl-serena-1",
    ownerId: "usr-owner-1",
    name: "Serena Grand Palace",
    businessName: "Serena Hospitality Group Ltd.",
    email: "info@serenapalace.com",
    phone: "+92 51 2874000",
    address: "Khyaban-e-Suhrawardy, Sector G-5/1",
    city: "Islamabad",
    country: "Pakistan",
    googleMapsUrl: "https://maps.google.com/?q=33.7294,73.0931",
    coordinates: { lat: 33.7294, lng: 73.0931 },
    description:
      "A magnificent 5-star luxury heritage hotel set in lush gardens with panoramic Margalla Hills views, royal dining suites, executive lounges, and a world-class temperature-controlled pool.",
    totalRooms: 30,
    category: "5 Star",
    businessLicenseUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80",
    cnicUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
    ],
    amenities: [
      "Free Wi-Fi",
      "Swimming Pool",
      "24/7 Room Service",
      "Air Conditioning",
      "Airport Shuttle",
      "Fitness Center / Gym",
      "Spa & Wellness",
      "Complimentary Breakfast",
    ],
    status: "active",
    isVerified: true,
    cleaningServiceEligible: true,
    eligibleFreeCleanings: 2,
    usedFreeCleanings: 0,
    createdAt: "2026-02-10T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
];

export const initialRooms: Room[] = [
  {
    id: "rm-serena-101",
    hotelId: "htl-serena-1",
    name: "Executive Deluxe Suite",
    type: "Deluxe Suite",
    pricePerNight: 240,
    capacity: 2,
    totalUnits: 15,
    availableUnits: 12,
    amenities: ["King Bed", "Margalla View Balcony", "Jacuzzi Bath", "Mini Bar", "High-Speed Wi-Fi"],
    photos: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Opulent executive suite with private sitting area, marble bathroom, and panoramic mountain views.",
    isActive: true,
    createdAt: "2026-02-15T00:00:00.000Z",
  },
];

export const initialBookings: Booking[] = [
  {
    id: "bkg-1001",
    hotelId: "htl-serena-1",
    roomId: "rm-serena-101",
    roomName: "Executive Deluxe Suite",
    guestName: "Zaid Qureshi",
    guestEmail: "zaid.q@example.com",
    guestPhone: "+92 301 5551234",
    checkInDate: "2026-08-20",
    checkOutDate: "2026-08-24",
    guestsCount: 2,
    totalPrice: 960,
    status: "confirmed",
    createdAt: "2026-08-14T10:00:00.000Z",
  },
];

export const initialCleaningTeams: CleaningTeam[] = [
  {
    id: "cln-team-alpha",
    name: "Capital Hygiene Squad Alpha",
    leaderName: "Kamran Akram",
    contactPhone: "+92 300 5551234",
    city: "Islamabad",
    activeAssignments: 0,
    status: "available",
  },
];

export const initialCleaningRequests: CleaningRequest[] = [];

export const initialReviews: Review[] = [
  {
    id: "rev-1",
    hotelId: "htl-serena-1",
    guestName: "David Miller",
    guestEmail: "david.m@wanderlust.com",
    rating: 5,
    comment: "World-class experience. The gardens, attentive staff, and spa exceeded our expectations.",
    response: "Thank you David! It was our pleasure hosting you at Serena Grand Palace.",
    respondedAt: "2026-08-10T14:00:00.000Z",
    createdAt: "2026-08-08T10:30:00.000Z",
  },
];

export const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    recipientId: "usr-owner-1",
    title: "Welcome to Cobalt Hotels!",
    message: "Your property Serena Grand Palace is active and accepting guest reservations.",
    type: "success",
    link: "/owner/dashboard",
    read: false,
    createdAt: "2026-08-10T10:00:00.000Z",
  },
];
