import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { eq } from "drizzle-orm";

import { db } from "@/db/adapter";
import type { TSelectSessionSchema } from "@/db/schemas/session.model";
import sessionModel from "@/db/schemas/session.model";
import type { TSelectUserSchema } from "@/db/schemas/user.model";
import userModel from "@/db/schemas/user.model";

export type SessionValidationResult =
  | { session: TSelectSessionSchema; user: TSelectUserSchema }
  | { session: null; user: null };

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
  return token;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const result = await db
    .select({ user: userModel, session: sessionModel })
    .from(sessionModel)
    .innerJoin(userModel, eq(sessionModel.userId, userModel.id))
    .where(eq(sessionModel.id, token));

  if (result.length < 1) {
    return { session: null, user: null };
  }

  const { user, session } = result[0];

  if (!user) {
    await db.delete(sessionModel).where(eq(sessionModel.id, session.id));
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionModel).where(eq(sessionModel.id, session.id));

    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await db
      .update(sessionModel)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionModel.id, session.id));
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionModel).where(eq(sessionModel.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  await db.delete(sessionModel).where(eq(sessionModel.id, userId));
}
