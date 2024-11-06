import { z } from "zod";

export const betterAuthUserSchema = z.object({
  id: z.string(),
  userId: z.string(),
  expiresAt: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
}).optional();

export const betterAuthSessionSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  image: z.string().url().optional().nullable(),
}).optional();
