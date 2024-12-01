import type { TInsertExpenseSchema } from "@/db/schemas/expense.model";

import { db } from "@/db/adapter";
import expenseModel from "@/db/schemas/expense.model";

interface IExpensePayload {
  amount: TInsertExpenseSchema["amount"];
  currency: TInsertExpenseSchema["currency"];
  splitType: TInsertExpenseSchema["splitType"];
  creatorId: TInsertExpenseSchema["creatorId"];
  payerId: TInsertExpenseSchema["payerId"];
  description?: TInsertExpenseSchema["description"];
}

export async function createExpenseRepository(
  expensePayload: IExpensePayload,
) {
  const [expense] = await db
    .insert(expenseModel)
    .values(expensePayload)
    .returning();

  return expense;
}
