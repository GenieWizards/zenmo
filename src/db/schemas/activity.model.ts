import type { z } from "zod";

import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import groupModel from "./group.model";
import userModel from "./user.model";

const activityModel = pgTable("activity", {
  id: varchar({ length: 60 })
    .$defaultFn(() => Bun.randomUUIDv7())
    .primaryKey()
    .notNull(),

  activity: text().notNull(),

  userId: varchar({ length: 60 })
    .notNull()
    .references(() => userModel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  groupId: varchar({ length: 60 }).references(() => groupModel.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// Schema for selecting/inserting a activity
export const selectActivitySchema = createSelectSchema(activityModel);
export const insertActivitySchema = createInsertSchema(activityModel);

export type TSelectActivitySchema = z.infer<typeof selectActivitySchema>;
export type TInsertActivitySchema = z.infer<typeof insertActivitySchema>;

export default activityModel;
