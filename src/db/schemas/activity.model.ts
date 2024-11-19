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

const activityModel = pgTable("activity", {
  id: varchar({ length: 60 })
    .$defaultFn(() => Bun.randomUUIDv7())
    .primaryKey()
    .notNull(),

  type: ActivityTypeEnum("activity_type").notNull(),
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

export type TSelectActivitySchema = z.infer<typeof selectActivitySchema>;
export type TInsertActivitySchema = z.infer<typeof insertActivitySchema>;

export default activityModel;
