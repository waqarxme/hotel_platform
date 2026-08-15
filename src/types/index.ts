export type UserRole = "admin" | "hotel_owner" | "customer";

export type HotelStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "active"
  | "rejected"
  | "suspended";

export type HotelCategory =
  | "1 Star"
  | "2 Star"
  | "3 Star"
  | "4 Star"
  | "5 Star"
  | "Boutique"
  | "Guest House"
  | "Apartment"
  | "Resort"
  | "Villa";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  hotelId?: string;
  createdAt: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Hotel {
  id: string;
  ownerId: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  googleMapsUrl?: string;
  coordinates?: Coordinates;
  description: string;
  totalRooms: number;
  category: HotelCategory;
  businessLicenseUrl?: string;
  cnicUrl?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  galleryImages: string[];
  amenities: string[];
  status: HotelStatus;
  rejectionReason?: string;
  adminNotes?: string;
  isVerified: boolean;
  cleaningServiceEligible: boolean;
  eligibleFreeCleanings: number;
  usedFreeCleanings: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  totalUnits: number;
  availableUnits: number;
  amenities: string[];
  photos: string[];
  description: string;
  isActive: boolean;
  createdAt: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  hotelId: string;
  roomId: string;
  roomName?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export type CleaningRequestStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface CleaningRequest {
  id: string;
  hotelId: string;
  hotelName: string;
  roomNumbers: string;
  requestedDate: string;
  status: CleaningRequestStatus;
  assignedTeamId?: string;
  assignedTeamName?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CleaningTeam {
  id: string;
  name: string;
  leaderName: string;
  contactPhone: string;
  city: string;
  activeAssignments: number;
  status: "available" | "busy" | "offline";
}

export interface Review {
  id: string;
  hotelId: string;
  guestName: string;
  guestEmail: string;
  rating: number;
  comment: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "danger";
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export interface AuthSession {
  user: User;
  token: string;
}
