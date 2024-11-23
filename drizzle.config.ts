import { defineConfig } from "drizzle-kit";

import env from "@/env";

export default defineConfig({
  schema: "./src/db/schemas/*",
  dialect: "postgresql",
  out: "./src/db/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: env.NODE_ENV === "development",
  strict: true,
  casing: "snake_case",
});
