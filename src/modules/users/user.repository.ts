import { eq } from "drizzle-orm";

import type { TInsertUserSchema } from "@/db/schemas/user.model";

import { db } from "@/db/adapter";
import userModel, { lower } from "@/db/schemas/user.model";

export async function createUserRepository(payload: TInsertUserSchema) {
  const [user] = await db.insert(userModel).values(payload).returning();

  return user;
}

export async function getUserRepository(email: string) {
  const [user] = await db
    .select()
    .from(userModel)
    .where(eq(lower(userModel.email), email.toLowerCase()));

  return user;
}
