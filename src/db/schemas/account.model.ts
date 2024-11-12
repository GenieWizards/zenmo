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
export const selectAccountSchema = createSelectSchema(accountModel);
export const insertAccountSchema = createInsertSchema(accountModel);

export type TSelectAccountSchema = z.infer<typeof selectAccountSchema>;
export type TInsertAccountSchema = z.infer<typeof insertAccountSchema>;

export default accountModel;
