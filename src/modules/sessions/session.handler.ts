import { generateSessionToken } from "@/common/utils/sessions.util";
import type { TInsertSessionSchema } from "@/db/schemas/session.model";

import { createSessionReposiroty } from "./session.repository";

export async function createSession(sessionPayload: TInsertSessionSchema) {
  const sessionToken = generateSessionToken();

  const sessionData: TInsertSessionSchema = {
    id: sessionToken,
    userId: sessionPayload.userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
  };

  const session = await createSessionReposiroty(sessionData);

  return session;
}
