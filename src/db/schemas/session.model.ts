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
export const selectSessionSchema = createSelectSchema(sessionModel);
export const insertSessionSchema = createInsertSchema(sessionModel);

export type TSelectSessionSchema = z.infer<typeof selectSessionSchema>;
export type TInsertSessionSchema = z.infer<typeof insertSessionSchema>;

export default sessionModel;
