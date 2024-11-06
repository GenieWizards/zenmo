import type { SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { z } from "zod";

import { sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { AuthRole, AuthRoles } from "@/common/enums";

export const authRolesEnum = pgEnum("status", AuthRoles);

const user = pgTable(
  "user",
  {
    id: varchar({ length: 60 })
      .$defaultFn(() => Bun.randomUUIDv7())
      .primaryKey()
      .notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    emailVerified: boolean().notNull().default(false),
    image: varchar({ length: 255 }),
    name: varchar({ length: 255 }),
    password: varchar({ length: 255 }),
    role: authRolesEnum("role").default(AuthRole.USER),

    createdAt: timestamp()
      .notNull()
      .defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow(),
  },
  table => [uniqueIndex("unique_email_idx").on(lower(table.email))],
);

// Schema for selecting a user - can be used to validate API responses
export const selectUserSchema = createSelectSchema(user);

export type TSelectUserSchema = z.infer<typeof selectUserSchema>;

export const insertUserSchema = createInsertSchema(
  user,
  {
    name: schema => schema.name.trim().min(3).max(100),
    email: schema => schema.email.email().trim().min(3).max(255),
  },
).required({
  email: true,
  name: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  role: true,
});

// custom lower function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export default user;
