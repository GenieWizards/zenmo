import { and, eq } from "drizzle-orm";

import { db } from "@/db/adapter";
import { accountModel } from "@/db/schemas";

export async function getAccountRepository(
  userId: string,
  provider = "credentials",
) {
  const [account] = await db
    .select()
    .from(accountModel)
    .where(
      and(
        eq(accountModel.userId, userId),
        eq(accountModel.providerId, provider),
      ),
    );

  return account;
}
