import type { SQL } from "drizzle-orm";
import { relations, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { AuthRoles, authRolesArr } from "@/common/enums";

import categoryModel from "./category.model";

export const authRolesEnum = pgEnum("role", authRolesArr);

const userModel = pgTable(
  "users",
  {
    id: varchar({ length: 60 })
      .$defaultFn(() => Bun.randomUUIDv7())
      .primaryKey()
      .notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    emailVerified: boolean().default(false),
    fullName: varchar({ length: 255 }),
    role: authRolesEnum("role").default(AuthRoles.USER),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  table => [uniqueIndex("unique_email_idx").on(lower(table.email))],
);

export const usersRelations = relations(userModel, ({ many }) => ({
  categories: many(categoryModel),
}));

// Schema for selecting/inserting a user
export const selectUserSchema = createSelectSchema(userModel, {
  id: schema => schema.id.describe("Unique identifier for the user"),
  email: schema => schema.email.describe("User's email address (unique)"),
  emailVerified: schema =>
    schema.emailVerified.describe("Whether the user's email has been verified"),
  fullName: schema => schema.fullName.describe("User's full name"),
  role: schema =>
    schema.role.describe("User's role in the system (e.g., USER, ADMIN)"),
  createdAt: schema =>
    schema.createdAt.describe("Timestamp when the user was created"),
  updatedAt: schema =>
    schema.updatedAt.describe("Timestamp when the user was last updated"),
});
export const insertUserSchema = createInsertSchema(userModel, {
  id: schema => schema.id.describe("Unique identifier for the user"),
  email: schema => schema.email.describe("User's email address (unique)"),
  emailVerified: schema =>
    schema.emailVerified.describe("Whether the user's email has been verified"),
  fullName: schema => schema.fullName.describe("User's full name"),
  role: schema =>
    schema.role.describe("User's role in the system (e.g., USER, ADMIN)"),
  createdAt: schema =>
    schema.createdAt.describe("Timestamp when the user was created"),
  updatedAt: schema =>
    schema.updatedAt.describe("Timestamp when the user was last updated"),
});

export type TSelectUserSchema = z.infer<typeof selectUserSchema>;
export type TInsertUserSchema = z.infer<typeof insertUserSchema>;

// custom lower function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export default userModel;
