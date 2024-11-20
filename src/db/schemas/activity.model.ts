import type { z } from "zod";

import {
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { activityTypeArr } from "@/common/enums";

import groupModel from "./group.model";

export const ActivityTypeEnum = pgEnum("activityType", activityTypeArr);
export type ActivityType = (typeof activityTypeArr)[number];

const activityModel = pgTable("activity", {
  id: varchar({ length: 60 })
    .$defaultFn(() => Bun.randomUUIDv7())
    .primaryKey()
    .notNull(),

  type: varchar({ length: 60 }).notNull().$type<ActivityType>(),
  metadata: jsonb().notNull(),

  groupId: varchar({ length: 60 }).references(() => groupModel.id),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// Schema for selecting/inserting a activity
export const selectActivitySchema = createSelectSchema(activityModel, {
  id: schema => schema.id.describe("Unique identifier for the activity"),
  type: schema =>
    schema.type.describe("Type of the activity/action performed"),
  metadata: schema =>
    schema.metadata.describe("Metadata associated with the activity"),
  groupId: schema =>
    schema.groupId.describe(
      "Reference to the group where activity was performed (optional)",
    ),
  createdAt: schema =>
    schema.createdAt.describe("Timestamp when the activity was created"),
  updatedAt: schema =>
    schema.updatedAt.describe("Timestamp when the activity was last updated"),
});
export const insertActivitySchema = createInsertSchema(activityModel, {
  id: schema => schema.id.describe("Unique identifier for the activity"),
  type: schema =>
    schema.type.describe("Type of the activity/action performed"),
  metadata: schema =>
    schema.metadata.describe("Metadata associated with the activity"),
  groupId: schema =>
    schema.groupId.describe(
      "Reference to the group where activity was performed (optional)",
    ),
  createdAt: schema =>
    schema.createdAt.describe("Timestamp when the activity was created"),
  updatedAt: schema =>
    schema.updatedAt.describe("Timestamp when the activity was last updated"),
});

type SelectActivitySchema = z.infer<typeof selectActivitySchema>;
type InsertActivitySchema = z.infer<typeof insertActivitySchema>;

// This is necessary otherwise typescript will complain about type field
export type TSelectActivitySchema = Omit<SelectActivitySchema, "type"> & {
  type: ActivityType;
};
export type TInsertActivitySchema = Omit<InsertActivitySchema, "type"> & {
  type: ActivityType;
};

export default activityModel;
