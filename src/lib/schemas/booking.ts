import { z } from "zod";

export const createBookingSchema = z.object({
  hotelId: z.string().min(1, "Hotel is required"),
  roomId: z.string().min(1, "Room category is required"),
  guestName: z.string().min(2, "Guest name is required"),
  guestEmail: z.string().email("Valid guest email is required"),
  guestPhone: z.string().min(8, "Valid phone number is required"),
  checkInDate: z.string().min(4, "Check-in date is required"),
  checkOutDate: z.string().min(4, "Check-out date is required"),
  guestsCount: z.coerce.number().int().min(1, "At least 1 guest required"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "checked_in", "completed", "cancelled"]),
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
