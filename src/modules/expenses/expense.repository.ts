import { AuthRoles } from "@/common/enums";
import { db } from "@/db/adapter";
import type { TInsertExpenseSchema } from "@/db/schemas/expense.model";
import expenseModel from "@/db/schemas/expense.model";
import type { TSelectUserSchema } from "@/db/schemas/user.model";

import { getCategoryRepository } from "../categories/category.repository";

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

// 1. Admin create expense - category should either belong to payer or global.
// 2. User create self paid expense - category should either belong to user or global.
// 3. User create expense for another payer - category should belong to payer.
export async function isCategoryValidToCreateExpense(categoryId: string, payerId: string | undefined, user: TSelectUserSchema) {
  const category = await getCategoryRepository(categoryId);
  let isValid = false;

  if (!category) {
    return { category: null, isValid };
  }

  if (user.role === AuthRoles.ADMIN) {
    isValid = category.userId === null || category.userId === payerId;
  } else {
    isValid = payerId ? category.userId === null : (category.userId === null || category.userId === user.id);
  }

  return { category, isValid };
}
