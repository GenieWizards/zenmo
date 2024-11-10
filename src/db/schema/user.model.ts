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
import { createSelectSchema } from "drizzle-zod";

import { AuthRoles, authRolesArr } from "@/common/enums";

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
  table => [uniqueIndex().on(lower(table.email))],
);

// Schema for selecting a user - can be used to validate API responses
export const selectUserSchema = createSelectSchema(userModel);

export type TSelectUserSchema = z.infer<typeof selectUserSchema>;

// custom lower function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export default userModel;
