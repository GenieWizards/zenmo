import { relations } from "drizzle-orm";
import { pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import groupModel from "./group.model";
import userModel from "./user.model";

export const usersToGroupsModel = pgTable(
  "users_to_groups",
  {
    userId: varchar({ length: 60 })
      .notNull()
      .references(() => userModel.id),
    groupId: varchar({ length: 60 })
      .notNull()
      .references(() => groupModel.id),
  },
  t => ({
    pk: primaryKey({ columns: [t.userId, t.groupId] }),
  }),
);

export const usersRelations = relations(userModel, ({ many }) => ({
  usersToGroups: many(usersToGroupsModel),
}));

export const groupsRelations = relations(groupModel, ({ many }) => ({
  usersToGroups: many(usersToGroupsModel),
}));

export const usersToGroupsRelations = relations(
  usersToGroupsModel,
  ({ one }) => ({
    group: one(groupModel, {
      fields: [usersToGroupsModel.groupId],
      references: [groupModel.id],
    }),
    user: one(userModel, {
      fields: [usersToGroupsModel.userId],
      references: [userModel.id],
    }),
  }),
);

// Schema for selecting/inserting a user-group relationship
export const selectUsersToGroupSchema = createSelectSchema(usersToGroupsModel, {
  userId: schema =>
    schema.userId.describe("Reference to the user who is part of the group"),
  groupId: schema =>
    schema.groupId.describe("Reference to the group the user belongs to"),
});

export const insertUsersToGroupSchema = createInsertSchema(usersToGroupsModel, {
  userId: schema =>
    schema.userId.describe("Reference to the user who is part of the group"),
  groupId: schema =>
    schema.groupId.describe("Reference to the group the user belongs to"),
});

export type TSelectUsersToGroupSchema = z.infer<
  typeof selectUsersToGroupSchema
>;
export type TInsertUsersToGroupSchema = z.infer<
  typeof insertUsersToGroupSchema
>;
