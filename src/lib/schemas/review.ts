import { z } from "zod";
import { safeUrlSchema } from "./hotel";

export const createReviewSchema = z.object({
  hotelId: z.string().min(1, "Hotel ID is required").max(100),
  guestName: z.string().min(2, "Guest name is required").max(100),
  guestEmail: z.string().email("Valid guest email is required").max(100),
  rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5 stars"),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(1000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const respondReviewSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required").max(100),
  response: z.string().min(5, "Response must be at least 5 characters").max(1000),
});

export type RespondReviewInput = z.infer<typeof respondReviewSchema>;

export const createNotificationSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID or 'all' is required").max(100),
  title: z.string().min(3, "Title is required").max(150),
  message: z.string().min(5, "Message is required").max(1000),
  type: z.enum(["info", "success", "warning", "danger"]).default("info"),
  link: safeUrlSchema,
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
