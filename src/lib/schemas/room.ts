import { z } from "zod";

export const roomCategorySchema = z.object({
  name: z.string().min(2, "Room category name is required"),
  type: z.string().min(2, "Room type is required"),
  pricePerNight: z.coerce.number().positive("Price per night must be greater than 0"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1 guest"),
  totalUnits: z.coerce.number().int().min(1, "Total units must be at least 1"),
  amenities: z.array(z.string()).default([]),
  photos: z.array(z.string()).default([]),
  description: z.string().min(5, "Description is required"),
  isActive: z.boolean().default(true),
});

export const roomUpdateSchema = roomCategorySchema.partial();

export type RoomCategoryInput = z.infer<typeof roomCategorySchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
