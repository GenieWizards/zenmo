import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

import userSchema from "./user.schema";

const account = pgTable("account", {
  id: varchar({ length: 60 })
    .$defaultFn(() => Bun.randomUUIDv7())
    .primaryKey()
    .notNull(),
  accountId: varchar({ length: 255 }).notNull(),
  providerId: varchar({ length: 255 }).notNull(),
  userId: varchar({ length: 60 }).notNull().references(() => userSchema.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  accessToken: varchar({ length: 255 }),
  refreshToken: varchar({ length: 255 }),
  idToken: varchar({ length: 255 }),
  expiresAt: timestamp(),
  password: varchar({ length: 255 }),
});

export default account;
