import { z } from "zod";

export const createCleaningRequestSchema = z.object({
  roomNumbers: z.string().min(1, "Room numbers or categories to clean are required"),
  requestedDate: z.string().min(4, "Requested date is required"),
  specialInstructions: z.string().optional(),
});

export type CreateCleaningRequestInput = z.infer<typeof createCleaningRequestSchema>;

export const assignCleaningTeamSchema = z.object({
  cleaningRequestId: z.string().min(1, "Request ID is required"),
  teamId: z.string().min(1, "Team ID is required"),
});

export type AssignCleaningTeamInput = z.infer<typeof assignCleaningTeamSchema>;

export const createCleaningTeamSchema = z.object({
  name: z.string().min(2, "Team name is required"),
  leaderName: z.string().min(2, "Team leader name is required"),
  contactPhone: z.string().min(8, "Contact phone is required"),
  city: z.string().min(2, "City is required"),
});

export type CreateCleaningTeamInput = z.infer<typeof createCleaningTeamSchema>;
