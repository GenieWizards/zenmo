import type { z } from "zod";

import { pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { GroupStatus, groupStatusArr } from "@/common/enums";

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
export const selectGroupSchema = createSelectSchema(groupModel);
export const insertGroupSchema = createInsertSchema(groupModel);

export type TSelectGroupSchema = z.infer<typeof selectGroupSchema>;
export type TInsertGroupSchema = z.infer<typeof insertGroupSchema>;

export default groupModel;
