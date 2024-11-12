import type { z } from "zod";

import {
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { splitTypeArr } from "@/common/enums";

import categoryModel from "./category.model";
import groupModel from "./group.model";
import userModel from "./user.model";

export const splitTypeEnum = pgEnum("splitType", splitTypeArr);

const expenseModel = pgTable("expense", {
  id: varchar({ length: 60 })
    .$defaultFn(() => Bun.randomUUIDv7())
    .primaryKey()
    .notNull(),

  payerId: varchar({ length: 60 })
    .notNull()
    .references(() => userModel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  categoryId: varchar({ length: 60 })
    .notNull()
    .references(() => categoryModel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  groupId: varchar({ length: 60 }).references(() => groupModel.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  amount: real().notNull(),
  currency: varchar({ length: 3 }).notNull(),
  splitType: splitTypeEnum("split_type").notNull(),
  description: text(),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// Schema for selecting/inserting a expense
export const selectExpenseSchema = createSelectSchema(expenseModel);
export const insertExpenseSchema = createInsertSchema(expenseModel);

export type TSelectExpenseSchema = z.infer<typeof selectExpenseSchema>;
export type TInsertExpenseSchema = z.infer<typeof insertExpenseSchema>;

export default expenseModel;
