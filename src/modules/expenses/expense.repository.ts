import type { TInsertExpenseSchema } from "@/db/schemas/expense.model";

import { db } from "@/db/adapter";
import expenseModel from "@/db/schemas/expense.model";

interface TExpensePayloadUser {
  amount: TInsertExpenseSchema["amount"];
  currency: TInsertExpenseSchema["currency"];
  splitType: TInsertExpenseSchema["splitType"];
  description?: TInsertExpenseSchema["description"];
}

interface TExpensePayloadAdmin {
  amount: TInsertExpenseSchema["amount"];
  currency: TInsertExpenseSchema["currency"];
  splitType: TInsertExpenseSchema["splitType"];
  payerId: TInsertExpenseSchema["payerId"];
  description?: TInsertExpenseSchema["description"];
}

export async function createExpenseRepositoryViaUser(
  expensePayload: TExpensePayloadUser,
  userId: string,
) {
  const [expense] = await db
    .insert(expenseModel)
    .values({
      ...expensePayload,
      payerId: userId,
      creatorId: userId,
    })
    .returning();

  return expense;
}

export async function createExpenseRepositoryViaAdmin(
  expensePayload: TExpensePayloadAdmin,
  userId: string,
) {
  const [expense] = await db
    .insert(expenseModel)
    .values({
      ...expensePayload,
      creatorId: userId,
    })
    .returning();

  return expense;
}
