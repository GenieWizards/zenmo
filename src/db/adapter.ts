import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import env from "@/env";

import * as schema from "./schemas";

export const queryClient = postgres(env.DATABASE_URL);
export const db = drizzle(queryClient, {
  casing: "snake_case",
  schema,
  logger: env.NODE_ENV === "development",
});

export type TDb = typeof db;
