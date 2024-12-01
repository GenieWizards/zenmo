import { z } from "zod";

import { AuthRoles } from "../enums";

export const userSchema = z.object({
  id: z.string().describe("Unique identifier for the user"),
  email: z.string().describe("Email address of the user"),
  emailVerified: z.boolean().nullable().describe("Whether the user email is verified"),
  fullName: z.string().nullable().describe("Name of the user"),
  role: z.enum([AuthRoles.ADMIN, AuthRoles.USER]).default(AuthRoles.USER).nullable().describe("Role of the user"),
  createdAt: z.date().describe("Timestamp when the user was created"),
  updatedAt: z.date().describe("Timestamp when the user was last updated"),
});

export type TUserSchema = z.infer<typeof userSchema>;
