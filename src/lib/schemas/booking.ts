import { z } from "zod";

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const createBookingSchema = z
  .object({
    hotelId: z.string().min(1, "Hotel is required"),
    roomId: z.string().min(1, "Room category is required"),
    guestName: z.string().min(2, "Guest name is required").max(100),
    guestEmail: z.string().email("Valid guest email is required").max(100),
    guestPhone: z.string().min(8, "Valid phone number is required").max(30),
    checkInDate: isoDateString,
    checkOutDate: isoDateString,
    guestsCount: z.coerce.number().int().min(1, "At least 1 guest required").max(20, "Maximum 20 guests"),
  })
  .refine((data) => new Date(data.checkOutDate) > new Date(data.checkInDate), {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  })
  .refine((data) => new Date(data.checkInDate) >= new Date(new Date().toDateString()), {
    message: "Check-in date cannot be in the past",
    path: ["checkInDate"],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "checked_in", "completed", "cancelled"]),
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
