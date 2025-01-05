import { eq } from "drizzle-orm";

import { db } from "@/db/adapter";
import type { TInsertSplitSchema } from "@/db/schemas/split.model";
import splitModel from "@/db/schemas/split.model";

type TSplitPayload = Omit<TInsertSplitSchema, "id" | "createdAt" | "updatedAt">;

export async function createSplitRepository(
  payload: TSplitPayload,
) {
  const [expense] = await db
    .insert(splitModel)
    .values(payload)
    .returning();

  return expense;
}

export async function getSplitsByExpenseIdRepository(
  expenseId: string,
) {
  const splits = await db
    .select()
    .from(splitModel)
    .where(eq(splitModel.expenseId, expenseId));

  return splits;
}
