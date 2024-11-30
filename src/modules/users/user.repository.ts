import { eq } from "drizzle-orm";

import { db } from "@/db/adapter";
import type { TInsertUserSchema } from "@/db/schemas/user.model";
import userModel, { lower } from "@/db/schemas/user.model";

export async function createUserRepository(payload: TInsertUserSchema) {
  const [user] = await db.insert(userModel).values(payload).returning();

  return user;
}

export async function getUserByEmailRepository(email: string) {
  const [user] = await db
    .select()
    .from(userModel)
    .where(eq(lower(userModel.email), email.toLowerCase()));

  return user;
}

export async function getUserByIdRepository(userId: string) {
  const [user] = await db
    .select()
    .from(userModel)
    .where(eq(userModel.id, userId));

  return user;
}
