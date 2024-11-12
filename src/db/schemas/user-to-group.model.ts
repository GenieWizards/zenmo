import { relations } from "drizzle-orm";
import { pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

import groupModel from "./group.model";
import userModel from "./user.model";

export const usersToGroups = pgTable(
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
  usersToGroups: many(usersToGroups),
}));

export const groupsRelations = relations(groupModel, ({ many }) => ({
  usersToGroups: many(usersToGroups),
}));

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  group: one(groupModel, {
    fields: [usersToGroups.groupId],
    references: [groupModel.id],
  }),
  user: one(userModel, {
    fields: [usersToGroups.userId],
    references: [userModel.id],
  }),
}));
