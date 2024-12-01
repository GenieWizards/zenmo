import { eq } from "drizzle-orm";

import { db } from "@/db/adapter";
import { sessionModel } from "@/db/schemas";
import type { TInsertSessionSchema } from "@/db/schemas/session.model";

export async function createSessionReposiroty(
  sessionData: TInsertSessionSchema,
) {
  const [session] = await db
    .insert(sessionModel)
    .values(sessionData)
    .returning();

  return session;
}

export async function deleteSessionRepository(sessionId: string) {
  const [session] = await db
    .delete(sessionModel)
    .where(eq(sessionModel.id, sessionId));

  return session;
}
