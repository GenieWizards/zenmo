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
export const selectCategorySchema = createSelectSchema(categoryModel, {
  id: schema => schema.id.describe("Unique identifier for the category"),
  name: schema => schema.name.min(2).describe("Name of the category"),
  description: schema =>
    schema.description.describe("Detailed description of the category"),
  userId: schema =>
    schema.userId.describe("ID of the user who owns this category (If any)"),
  isActive: schema =>
    schema.isActive.describe("Whether the category is active or archived"),
  icon: schema => schema.icon.describe("Icon identifier for the category"),
  createdAt: schema =>
    schema.createdAt.describe("Timestamp when the category was created"),
  updatedAt: schema =>
    schema.updatedAt.describe("Timestamp when the category was last updated"),
});
export const insertCategorySchema = createInsertSchema(categoryModel, {
  id: schema => schema.id.describe("Unique identifier for the category"),
  name: schema => schema.name.min(2).describe("Name of the category"),
  description: schema =>
    schema.description.describe("Detailed description of the category"),
  userId: schema =>
    schema.userId.describe("ID of the user who owns this category (If any)"),
  isActive: schema =>
    schema.isActive.describe("Whether the category is active or archived"),
  icon: schema => schema.icon.describe("Icon identifier for the category"),
  createdAt: schema =>
    schema.createdAt.describe("Timestamp when the category was created"),
  updatedAt: schema =>
    schema.updatedAt.describe("Timestamp when the category was last updated"),
});

export type TSelectCategorySchema = z.infer<typeof selectCategorySchema>;
export type TInsertCategorySchema = z.infer<typeof insertCategorySchema>;

export default categoryModel;
