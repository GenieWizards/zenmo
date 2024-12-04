import { GroupStatus, groupStatusArr } from "@/common/enums";
import { pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import userModel from "./user.model";

export const groupStatusEnum = pgEnum("status", groupStatusArr);

const groupModel = pgTable("group", {
  id: varchar({ length: 60 })
    .$defaultFn(() => Bun.randomUUIDv7())
    .primaryKey()
    .notNull(),

  name: varchar({ length: 255 }).notNull(),

  creatorId: varchar({ length: 60 })
    .notNull()
    .references(() => userModel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  status: groupStatusEnum("status").default(GroupStatus.UNSETTLED),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// Schema for selecting/inserting a group
export const selectGroupSchema = createSelectSchema(groupModel, {
  id: schema => schema.id.describe("Unique identifier for the group"),
  name: schema => schema.name.describe("Name of the group"),
  creatorId: schema =>
    schema.creatorId.describe("Reference to the user who created the group"),
  status: schema =>
    schema.status.describe(
      "Current status of the group (settled or unsettled)",
    ),
  createdAt: schema =>
    schema.createdAt.describe("Timestamp when the group was created"),
  updatedAt: schema =>
    schema.updatedAt.describe("Timestamp when the group was last updated"),
});
export const insertGroupSchema = createInsertSchema(groupModel, {
  id: schema => schema.id.describe("Unique identifier for the group"),
  name: schema => schema.name.describe("Name of the group"),
  creatorId: schema =>
    schema.creatorId.describe("Reference to the user who created the group"),
  status: schema =>
    schema.status.describe(
      "Current status of the group (settled or unsettled)",
    ),
  createdAt: schema =>
    schema.createdAt.describe("Timestamp when the group was created"),
  updatedAt: schema =>
    schema.updatedAt.describe("Timestamp when the group was last updated"),
});

export type TSelectGroupSchema = z.infer<typeof selectGroupSchema>;
export type TInsertGroupSchema = z.infer<typeof insertGroupSchema>;

export default groupModel;
