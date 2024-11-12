import type { z } from "zod";

import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import userModel, { lower } from "./user.model";

const categoryModel = pgTable(
  "category",
  {
    id: varchar({ length: 60 })
      .$defaultFn(() => Bun.randomUUIDv7())
      .primaryKey()
      .notNull(),

    name: varchar({ length: 255 }).notNull(),
    description: text(),

    userId: varchar({ length: 60 }).references(() => userModel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

    isActive: boolean().default(true).notNull(),
    icon: varchar({ length: 255 }),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  table => [
    uniqueIndex("unique_name_userId_idx").on(lower(table.name), table.userId),
  ],
);

export const categoryRelations = relations(categoryModel, ({ one }) => ({
  author: one(userModel, {
    fields: [categoryModel.userId],
    references: [userModel.id],
  }),
}));

// Schema for selecting/inserting a category
export const selectCategorySchema = createSelectSchema(categoryModel);
export const insertCategorySchema = createInsertSchema(categoryModel);

export type TSelectCategorySchema = z.infer<typeof selectCategorySchema>;
export type TInsertCategorySchema = z.infer<typeof insertCategorySchema>;

export default categoryModel;
