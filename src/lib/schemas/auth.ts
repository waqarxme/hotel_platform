import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "hotel_owner", "customer"]).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
    role: z.enum(["admin", "hotel_owner", "customer"]).default("hotel_owner"),
  })
  .refine((data) => data.role !== "admin", {
    message: "Administrator accounts cannot be self-registered",
    path: ["role"],
  });

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
