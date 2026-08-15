import { z } from "zod";
import { isSafeUrl } from "@/lib/security/sanitize";

export const safeUrlSchema = z
  .string()
  .optional()
  .refine((val) => isSafeUrl(val), { message: "Invalid URL scheme provided" })
  .or(z.literal(""));

export const hotelCategoryEnum = z.enum([
  "1 Star",
  "2 Star",
  "3 Star",
  "4 Star",
  "5 Star",
  "Boutique",
  "Guest House",
  "Apartment",
  "Resort",
  "Villa",
]);

// Option 2: Public Hotel Owner Registration Request Schema
export const hotelRegistrationSchema = z.object({
  hotelName: z.string().min(2, "Hotel name must be at least 2 characters").max(100),
  businessName: z.string().min(2, "Business / Owner legal name is required").max(100),
  email: z.string().email("Valid primary contact email is required").max(100),
  phone: z.string().min(8, "Valid primary phone number is required").max(30),
  address: z.string().min(5, "Full street address of the hotel is required").max(200),
  city: z.string().min(2, "City is required").max(50),
  country: z.string().min(2, "Country is required").max(50),
  googleMapsUrl: safeUrlSchema,
  description: z.string().min(20, "Please provide at least 20 characters describing the hotel").max(2000),
  totalRooms: z.coerce.number().int().positive("Total room count must be at least 1").max(5000),
  category: hotelCategoryEnum,
  businessLicenseUrl: safeUrlSchema,
  cnicUrl: safeUrlSchema,
  logoUrl: safeUrlSchema,
  coverImageUrl: safeUrlSchema,
  amenities: z.array(z.string().max(50)).default([]),
  ownerPassword: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export type HotelRegistrationInput = z.infer<typeof hotelRegistrationSchema>;

// Option 1: Admin Adds Hotel Profile Directly
export const adminCreateHotelSchema = z.object({
  hotelName: z.string().min(2, "Hotel name is required").max(100),
  businessName: z.string().min(2, "Owner / Business name is required").max(100),
  ownerEmail: z.string().email("Valid owner email is required").max(100),
  ownerName: z.string().min(2, "Owner name is required").max(100),
  phone: z.string().min(8, "Phone number is required").max(30),
  address: z.string().min(5, "Address is required").max(200),
  city: z.string().min(2, "City is required").max(50),
  country: z.string().min(2, "Country is required").max(50),
  category: hotelCategoryEnum,
  totalRooms: z.coerce.number().int().positive("Room count must be at least 1").max(5000),
  description: z.string().min(10, "Description is required").max(2000),
  logoUrl: safeUrlSchema,
  coverImageUrl: safeUrlSchema,
  amenities: z.array(z.string().max(50)).default([]),
  autoApprove: z.boolean().default(true),
  ownerPassword: z.string().min(8, "Password must be at least 8 characters").max(100).optional(),
});

export type AdminCreateHotelInput = z.infer<typeof adminCreateHotelSchema>;

// Admin Approval Actions
export const approveHotelSchema = z.object({
  adminNotes: z.string().max(1000).optional(),
});

export const rejectHotelSchema = z.object({
  rejectionReason: z.string().min(5, "A rejection reason explaining what to fix is required").max(1000),
});

export const suspendHotelSchema = z.object({
  reason: z.string().min(3, "Suspension reason is required").max(1000),
});

export const updateHotelProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  businessName: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(30).optional(),
  address: z.string().min(5).max(200).optional(),
  city: z.string().min(2).max(50).optional(),
  country: z.string().min(2).max(50).optional(),
  googleMapsUrl: safeUrlSchema,
  description: z.string().min(20).max(2000).optional(),
  totalRooms: z.coerce.number().int().positive().max(5000).optional(),
  category: hotelCategoryEnum.optional(),
  logoUrl: safeUrlSchema,
  coverImageUrl: safeUrlSchema,
  galleryImages: z.array(z.string()).optional(),
  amenities: z.array(z.string().max(50)).optional(),
});

export type UpdateHotelProfileInput = z.infer<typeof updateHotelProfileSchema>;
