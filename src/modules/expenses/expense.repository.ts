import type { TInsertExpenseSchema } from "@/db/schemas/expense.model";

import { db } from "@/db/adapter";
import expenseModel from "@/db/schemas/expense.model";

type TExpensePayload = Pick<TInsertExpenseSchema, "amount" | "currency" | "splitType" | "creatorId" | "payerId" | "description" >;

export async function createExpenseRepository(
  expensePayload: TExpensePayload,
) {
  const [expense] = await db
    .insert(expenseModel)
    .values(expensePayload)
    .returning();

  return expense;
}
