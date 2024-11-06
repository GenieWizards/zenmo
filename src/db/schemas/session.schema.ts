import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

import userSchema from "./user.schema";

const session = pgTable("session", {
  id: varchar({ length: 60 })
    .$defaultFn(() => Bun.randomUUIDv7())
    .primaryKey()
    .notNull(),
  expiresAt: timestamp().notNull(),
  ipAddress: varchar({ length: 255 }),
  userAgent: varchar({ length: 255 }),
  userId: varchar()
    .notNull()
    .references(() => userSchema.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export default session;
