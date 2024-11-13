import type { z } from "zod";

import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import userModel from "./user.model";

const sessionModel = pgTable("session", {
  id: varchar({ length: 80 }).primaryKey().notNull(),
  expiresAt: timestamp().notNull(),
  ipAddress: varchar({ length: 255 }),
  userAgent: varchar({ length: 255 }),

  userId: varchar()
    .notNull()
    .references(() => userModel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

// Schema for selecting/inserting a session
export const selectSessionSchema = createSelectSchema(sessionModel, {
  id: schema => schema.id.describe("Unique identifier for the session"),
  expiresAt: schema =>
    schema.expiresAt.describe("Timestamp when the session expires"),
  ipAddress: schema =>
    schema.ipAddress.describe(
      "IP address of the client when session was created",
    ),
  userAgent: schema =>
    schema.userAgent.describe("Browser/client user agent string"),
  userId: schema =>
    schema.userId.describe("Reference to the user this session belongs to"),
});
export const insertSessionSchema = createInsertSchema(sessionModel, {
  id: schema => schema.id.describe("Unique identifier for the session"),
  expiresAt: schema =>
    schema.expiresAt.describe("Timestamp when the session expires"),
  ipAddress: schema =>
    schema.ipAddress.describe(
      "IP address of the client when session was created",
    ),
  userAgent: schema =>
    schema.userAgent.describe("Browser/client user agent string"),
  userId: schema =>
    schema.userId.describe("Reference to the user this session belongs to"),
});

export type TSelectSessionSchema = z.infer<typeof selectSessionSchema>;
export type TInsertSessionSchema = z.infer<typeof insertSessionSchema>;

export default sessionModel;
