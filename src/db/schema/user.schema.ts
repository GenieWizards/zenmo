import type { SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { z } from "zod";

import { sql } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

import { AuthRole, AuthRoles } from "@/common/enums";

export const authRolesEnum = pgEnum("status", AuthRoles);

const userSchema = pgTable(
  "users",
  {
    id: text()
      .$defaultFn(() => Bun.randomUUIDv7())
      .primaryKey()
      .notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    fullName: varchar({ length: 255 }),
    password: varchar({ length: 255 }),
    role: authRolesEnum("role").default(AuthRole.USER),

    createdAt: timestamp({ mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp({ mode: "string" })
      .notNull()
      .defaultNow(),
  },
  table => ({
    emailUniqueIndex: uniqueIndex().on(lower(table.email)),
  }),
);

// Schema for selecting a user - can be used to validate API responses
export const selectUserSchema = createSelectSchema(userSchema);

export type TSelectUserSchema = z.infer<typeof selectUserSchema>;

// custom lower function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export default userSchema;
