import type { z } from "zod";

import { pgTable, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import userModel from "./user.model";

const accountModel = pgTable(
  "account",
  {
    id: varchar({ length: 60 })
      .$defaultFn(() => Bun.randomUUIDv7())
      .primaryKey()
      .notNull(),
    providerId: varchar({ length: 255 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),

    userId: varchar({ length: 60 })
      .notNull()
      .references(() => userModel.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    accessToken: varchar({ length: 255 }),
    refreshToken: varchar({ length: 255 }),
    idToken: varchar({ length: 255 }),
    expiresAt: timestamp(),
    password: varchar({ length: 255 }),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  table => [unique().on(table.userId, table.providerId)],
);

// Schema for selecting/inserting a account
export const selectAccountSchema = createSelectSchema(accountModel, {
  id: schema => schema.id.describe("Unique identifier for the account"),
  providerId: schema =>
    schema.providerId.describe(
      "ID of the OAuth provider (e.g., 'credentials', google', 'github')",
    ),
  providerAccountId: schema =>
    schema.providerAccountId.describe("User's ID from the OAuth provider"),
  userId: schema =>
    schema.userId.describe("Reference to the user who owns this account"),
  accessToken: schema => schema.accessToken.describe("OAuth access token"),
  refreshToken: schema => schema.refreshToken.describe("OAuth refresh token"),
  idToken: schema => schema.idToken.describe("OAuth ID token"),
  expiresAt: schema =>
    schema.expiresAt.describe("Timestamp when the access token expires"),
  password: schema =>
    schema.password.describe(
      "Hashed password for password-based authentication",
    ),
  createdAt: schema =>
    schema.createdAt.describe("Timestamp when the account was created"),
  updatedAt: schema =>
    schema.updatedAt.describe("Timestamp when the account was last updated"),
});
export const insertAccountSchema = createInsertSchema(accountModel, {
  id: schema => schema.id.describe("Unique identifier for the account"),
  providerId: schema =>
    schema.providerId.describe(
      "ID of the OAuth provider (e.g., 'credentials', google', 'github')",
    ),
  providerAccountId: schema =>
    schema.providerAccountId.describe("User's ID from the OAuth provider"),
  userId: schema =>
    schema.userId.describe("Reference to the user who owns this account"),
  accessToken: schema => schema.accessToken.describe("OAuth access token"),
  refreshToken: schema => schema.refreshToken.describe("OAuth refresh token"),
  idToken: schema => schema.idToken.describe("OAuth ID token"),
  expiresAt: schema =>
    schema.expiresAt.describe("Timestamp when the access token expires"),
  password: schema =>
    schema.password.describe(
      "Hashed password for password-based authentication",
    ),
  createdAt: schema =>
    schema.createdAt.describe("Timestamp when the account was created"),
  updatedAt: schema =>
    schema.updatedAt.describe("Timestamp when the account was last updated"),
});

export type TSelectAccountSchema = z.infer<typeof selectAccountSchema>;
export type TInsertAccountSchema = z.infer<typeof insertAccountSchema>;

export default accountModel;
