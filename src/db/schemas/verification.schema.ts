import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

const verification = pgTable("verification", {
  id: varchar({ length: 60 })
    .$defaultFn(() => Bun.randomUUIDv7())
    .primaryKey()
    .notNull(),
  identifier: varchar({ length: 255 }).notNull(),
  value: varchar({ length: 255 }).notNull(),
  expiresAt: timestamp().notNull(),
});

export default verification;
