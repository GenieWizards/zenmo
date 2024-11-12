import type { z } from "zod";

import {
  boolean,
  pgTable,
  real,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import expenseModel from "./expense.model";
import userModel from "./user.model";

const splitModel = pgTable("split", {
  id: varchar({ length: 60 })
    .$defaultFn(() => Bun.randomUUIDv7())
    .primaryKey()
    .notNull(),

  userId: varchar({ length: 60 })
    .notNull()
    .references(() => userModel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  expenseId: varchar({ length: 60 })
    .notNull()
    .references(() => expenseModel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  amount: real().notNull(),
  isSettled: boolean().default(false),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// Schema for selecting/inserting a split
export const selectSplitSchema = createSelectSchema(expenseModel);
export const insertSplitSchema = createInsertSchema(expenseModel);

export type TSelectSplitSchema = z.infer<typeof selectSplitSchema>;
export type TInsertSplitSchema = z.infer<typeof insertSplitSchema>;

export default splitModel;
