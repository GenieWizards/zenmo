import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db/adapter";
import env from "@/env";

export const auth = betterAuth({
  appName: "Finance Management",
  baseURL: "http://localhost:8998",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: env.ALLOWED_ORIGINS?.split(",") || [],
  rateLimit: {
    enabled: true,
  },
});
