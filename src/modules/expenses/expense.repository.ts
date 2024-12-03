import type { TInsertExpenseSchema } from "@/db/schemas/expense.model";

import { db } from "@/db/adapter";
import expenseModel from "@/db/schemas/expense.model";

type TExpensePayload = Omit<TInsertExpenseSchema, "id" | "createdAt" | "updatedAt" | "groupId" >;

export async function createExpenseRepository(
  expensePayload: TExpensePayload,
) {
  const [expense] = await db
    .insert(expenseModel)
    .values(expensePayload)
    .returning();

  return expense;
}
