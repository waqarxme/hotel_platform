import {
  User,
  Hotel,
  Room,
  Booking,
  CleaningRequest,
  CleaningTeam,
  Review,
  Notification,
  HotelStatus,
} from "@/types";
import {
  initialUsers,
  initialHotels,
  initialRooms,
  initialBookings,
  initialCleaningTeams,
  initialCleaningRequests,
  initialReviews,
  initialNotifications,
} from "./seed-data";
import { sanitizeRecord, sanitizeInput } from "@/lib/security/sanitize";

// Global singleton memory holder for serverless warm execution
interface DatabaseState {
  users: User[];
  hotels: Hotel[];
  rooms: Room[];
  bookings: Booking[];
  cleaningTeams: CleaningTeam[];
  cleaningRequests: CleaningRequest[];
  reviews: Review[];
  notifications: Notification[];
}

declare global {
  // eslint-disable-next-line no-var
  var __HOTEL_PLATFORM_DB__: DatabaseState | undefined;
}

function getDatabase(): DatabaseState {
  if (!global.__HOTEL_PLATFORM_DB__) {
    global.__HOTEL_PLATFORM_DB__ = {
      users: [...initialUsers],
      hotels: [...initialHotels],
      rooms: [...initialRooms],
      bookings: [...initialBookings],
      cleaningTeams: [...initialCleaningTeams],
      cleaningRequests: [...initialCleaningRequests],
      reviews: [...initialReviews],
      notifications: [...initialNotifications],
    };
  }
  return global.__HOTEL_PLATFORM_DB__;
}

export const db = {
  // --- USERS ---
  findUserByEmail(email: string): User | undefined {
    const state = getDatabase();
    return state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById(id: string): User | undefined {
    const state = getDatabase();
    return state.users.find((u) => u.id === id);
  },

  createUser(user: Omit<User, "id" | "createdAt">): User {
    const state = getDatabase();
    const clean = sanitizeRecord(user);
    const newUser: User = {
      ...clean,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    state.users.push(newUser);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const state = getDatabase();
    const index = state.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    state.users[index] = { ...state.users[index], ...sanitizeRecord(updates) };
    return state.users[index];
  },

  // --- HOTELS ---
  getHotels(statusFilter?: HotelStatus): Hotel[] {
    const state = getDatabase();
    if (!statusFilter) return [...state.hotels];
    return state.hotels.filter((h) => h.status === statusFilter);
  },

  getPublicHotels(): Hotel[] {
    const state = getDatabase();
    return state.hotels.filter((h) => h.status === "active" || h.status === "approved");
  },

  findHotelById(id: string): Hotel | undefined {
    const state = getDatabase();
    return state.hotels.find((h) => h.id === id);
  },

  findHotelByOwnerId(ownerId: string): Hotel | undefined {
    const state = getDatabase();
    return state.hotels.find((h) => h.ownerId === ownerId);
  },

  createHotel(hotelData: Omit<Hotel, "id" | "createdAt" | "updatedAt" | "isVerified" | "cleaningServiceEligible" | "eligibleFreeCleanings" | "usedFreeCleanings"> & { status?: HotelStatus }): Hotel {
    const state = getDatabase();
    const clean = sanitizeRecord(hotelData);
    const newHotel: Hotel = {
      ...clean,
      id: `htl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: hotelData.status ?? "pending_approval",
      isVerified: hotelData.status === "approved" || hotelData.status === "active",
      cleaningServiceEligible: false,
      eligibleFreeCleanings: 0,
      usedFreeCleanings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.hotels.unshift(newHotel);

    // Update user hotelId link if owner exists
    this.updateUser(newHotel.ownerId, { hotelId: newHotel.id });

    // Notify admin
    this.createNotification({
      recipientId: "usr-admin-1",
      title: "New Hotel Registration Submitted",
      message: `${newHotel.name} (${newHotel.city}) has submitted a registration request for approval.`,
      type: "info",
      link: `/admin/hotels/${newHotel.id}`,
    });

    return newHotel;
  },

  updateHotel(id: string, updates: Partial<Hotel>): Hotel | undefined {
    const state = getDatabase();
    const index = state.hotels.findIndex((h) => h.id === id);
    if (index === -1) return undefined;

    const current = state.hotels[index];
    const updatedHotel: Hotel = {
      ...current,
      ...sanitizeRecord(updates),
      updatedAt: new Date().toISOString(),
    };
    state.hotels[index] = updatedHotel;
    return updatedHotel;
  },

  // Admin Actions
  approveHotel(id: string, adminNotes?: string): Hotel | undefined {
    const hotel = this.findHotelById(id);
    if (!hotel) return undefined;

    const updated = this.updateHotel(id, {
      status: "approved",
      isVerified: true,
      adminNotes: adminNotes ?? hotel.adminNotes,
      rejectionReason: undefined,
    });

    if (updated) {
      this.createNotification({
        recipientId: hotel.ownerId,
        title: "Hotel Application Approved! 🎉",
        message: `Congratulations! ${hotel.name} has been approved. Your full hotel management dashboard is now unlocked.`,
        type: "success",
        link: "/owner/dashboard",
      });
    }

    return updated;
  },

  rejectHotel(id: string, rejectionReason: string): Hotel | undefined {
    const hotel = this.findHotelById(id);
    if (!hotel) return undefined;

    const updated = this.updateHotel(id, {
      status: "rejected",
      rejectionReason,
    });

    if (updated) {
      this.createNotification({
        recipientId: hotel.ownerId,
        title: "Registration Requires Action",
        message: `Your registration for ${hotel.name} was rejected: "${rejectionReason}". You can update and resubmit your details.`,
        type: "danger",
        link: "/owner/profile",
      });
    }

    return updated;
  },

  suspendHotel(id: string, reason: string): Hotel | undefined {
    const hotel = this.findHotelById(id);
    if (!hotel) return undefined;

    const updated = this.updateHotel(id, {
      status: "suspended",
      adminNotes: reason,
    });

    if (updated) {
      this.createNotification({
        recipientId: hotel.ownerId,
        title: "Hotel Status Suspended",
        message: `Your hotel ${hotel.name} has been suspended by administration. Reason: ${reason}`,
        type: "danger",
        link: "/owner/dashboard",
      });
    }

    return updated;
  },

  reactivateHotel(id: string): Hotel | undefined {
    const hotel = this.findHotelById(id);
    if (!hotel) return undefined;

    const updated = this.updateHotel(id, {
      status: "active",
      adminNotes: undefined,
    });

    if (updated) {
      this.createNotification({
        recipientId: hotel.ownerId,
        title: "Hotel Reactivated",
        message: `Your hotel ${hotel.name} is now active and live on the public booking portal.`,
        type: "success",
        link: "/owner/dashboard",
      });
    }

    return updated;
  },

  // --- ROOMS ---
  getRoomsByHotelId(hotelId: string): Room[] {
    const state = getDatabase();
    return state.rooms.filter((r) => r.hotelId === hotelId);
  },

  createRoom(roomData: Omit<Room, "id" | "createdAt">): Room {
    const state = getDatabase();
    const clean = sanitizeRecord(roomData);
    const newRoom: Room = {
      ...clean,
      id: `rm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    state.rooms.push(newRoom);
    return newRoom;
  },

  updateRoom(id: string, updates: Partial<Room>): Room | undefined {
    const state = getDatabase();
    const index = state.rooms.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    state.rooms[index] = { ...state.rooms[index], ...sanitizeRecord(updates) };
    return state.rooms[index];
  },

  deleteRoom(id: string): boolean {
    const state = getDatabase();
    const index = state.rooms.findIndex((r) => r.id === id);
    if (index === -1) return false;
    state.rooms.splice(index, 1);
    return true;
  },

  // --- BOOKINGS ---
  getBookingsByHotelId(hotelId: string): Booking[] {
    const state = getDatabase();
    return state.bookings.filter((b) => b.hotelId === hotelId);
  },

  getAllBookings(): Booking[] {
    const state = getDatabase();
    return [...state.bookings];
  },

  createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "status"> & { status?: Booking["status"] }): Booking {
    const state = getDatabase();
    const clean = sanitizeRecord(bookingData);
    const newBooking: Booking = {
      ...clean,
      id: `bkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: bookingData.status ?? "confirmed",
      createdAt: new Date().toISOString(),
    };
    state.bookings.unshift(newBooking);

    // Decrement inventory for the booked room
    const room = state.rooms.find((r) => r.id === bookingData.roomId);
    if (room) {
      room.availableUnits = Math.max(0, room.availableUnits - 1);
    }

    // Calculate free cleaning quota for hotel
    const hotelBookings = state.bookings.filter((b) => b.hotelId === bookingData.hotelId);
    const completedCount = hotelBookings.filter((b) => b.status === "completed" || b.status === "confirmed").length;
    const earnedCleanings = Math.floor(completedCount / 5);

    const hotel = this.findHotelById(bookingData.hotelId);
    if (hotel) {
      this.updateHotel(hotel.id, {
        cleaningServiceEligible: earnedCleanings > 0,
        eligibleFreeCleanings: earnedCleanings,
      });

      // Notify owner of new booking
      this.createNotification({
        recipientId: hotel.ownerId,
        title: "New Reservation Received!",
        message: `New booking for ${newBooking.roomName ?? "Room"} from ${newBooking.guestName} (${newBooking.checkInDate} to ${newBooking.checkOutDate}).`,
        type: "success",
        link: "/owner/bookings",
      });
    }

    return newBooking;
  },

  updateBookingStatus(id: string, status: Booking["status"]): Booking | undefined {
    const state = getDatabase();
    const index = state.bookings.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    state.bookings[index].status = status;
    return state.bookings[index];
  },

  // --- CLEANING SERVICES ---
  getCleaningRequests(hotelId?: string): CleaningRequest[] {
    const state = getDatabase();
    if (hotelId) return state.cleaningRequests.filter((c) => c.hotelId === hotelId);
    return [...state.cleaningRequests];
  },

  createCleaningRequest(request: Omit<CleaningRequest, "id" | "createdAt" | "updatedAt" | "status">): CleaningRequest {
    const state = getDatabase();
    const clean = sanitizeRecord(request);
    const newRequest: CleaningRequest = {
      ...clean,
      id: `clr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.cleaningRequests.unshift(newRequest);

    // Deduct available quota
    const hotel = this.findHotelById(request.hotelId);
    if (hotel && hotel.eligibleFreeCleanings > hotel.usedFreeCleanings) {
      this.updateHotel(hotel.id, {
        usedFreeCleanings: hotel.usedFreeCleanings + 1,
      });
    }

    // Notify admin
    this.createNotification({
      recipientId: "usr-admin-1",
      title: "Cleaning Service Requested",
      message: `${request.hotelName} requested a complimentary deep cleaning for ${request.requestedDate}.`,
      type: "info",
      link: "/admin/cleaning",
    });

    return newRequest;
  },

  assignCleaningTeam(requestId: string, teamId: string): CleaningRequest | undefined {
    const state = getDatabase();
    const requestIndex = state.cleaningRequests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) return undefined;

    const team = state.cleaningTeams.find((t) => t.id === teamId);
    if (!team) return undefined;

    state.cleaningRequests[requestIndex] = {
      ...state.cleaningRequests[requestIndex],
      status: "assigned",
      assignedTeamId: team.id,
      assignedTeamName: team.name,
      updatedAt: new Date().toISOString(),
    };

    team.activeAssignments += 1;

    // Notify hotel owner
    const hotel = this.findHotelById(state.cleaningRequests[requestIndex].hotelId);
    if (hotel) {
      this.createNotification({
        recipientId: hotel.ownerId,
        title: "Cleaning Team Assigned!",
        message: `${team.name} has been dispatched for your hotel's cleaning request on ${state.cleaningRequests[requestIndex].requestedDate}.`,
        type: "success",
        link: "/owner/cleaning",
      });
    }

    return state.cleaningRequests[requestIndex];
  },

  getCleaningTeams(): CleaningTeam[] {
    const state = getDatabase();
    return [...state.cleaningTeams];
  },

  createCleaningTeam(team: Omit<CleaningTeam, "id" | "activeAssignments" | "status">): CleaningTeam {
    const state = getDatabase();
    const clean = sanitizeRecord(team);
    const newTeam: CleaningTeam = {
      ...clean,
      id: `cln-team-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      activeAssignments: 0,
      status: "available",
    };
    state.cleaningTeams.push(newTeam);
    return newTeam;
  },

  // --- REVIEWS ---
  getReviewsByHotelId(hotelId: string): Review[] {
    const state = getDatabase();
    return state.reviews.filter((r) => r.hotelId === hotelId);
  },

  createReview(review: Omit<Review, "id" | "createdAt">): Review {
    const state = getDatabase();
    const clean = sanitizeRecord(review);
    const newReview: Review = {
      ...clean,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    state.reviews.unshift(newReview);

    // Notify owner
    const hotel = this.findHotelById(review.hotelId);
    if (hotel) {
      this.createNotification({
        recipientId: hotel.ownerId,
        title: `New ${review.rating}★ Review Received`,
        message: `${review.guestName} left a review: "${review.comment.substring(0, 80)}..."`,
        type: "info",
        link: "/owner/reviews",
      });
    }

    return newReview;
  },

  respondToReview(reviewId: string, responseText: string): Review | undefined {
    const state = getDatabase();
    const index = state.reviews.findIndex((r) => r.id === reviewId);
    if (index === -1) return undefined;

    state.reviews[index] = {
      ...state.reviews[index],
      response: sanitizeInput(responseText),
      respondedAt: new Date().toISOString(),
    };
    return state.reviews[index];
  },

  // --- NOTIFICATIONS ---
  getNotifications(recipientId: string): Notification[] {
    const state = getDatabase();
    return state.notifications.filter((n) => n.recipientId === recipientId || n.recipientId === "all");
  },

  createNotification(notif: Omit<Notification, "id" | "createdAt" | "read">): Notification {
    const state = getDatabase();
    const clean = sanitizeRecord(notif);
    const newNotif: Notification = {
      ...clean,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    state.notifications.unshift(newNotif);
    return newNotif;
  },

  markNotificationRead(id: string): boolean {
    const state = getDatabase();
    const notif = state.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.read = true;
    return true;
  },
};
