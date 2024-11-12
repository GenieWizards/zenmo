import { and, eq, isNull, or } from "drizzle-orm";

import type { TInsertCategorySchema } from "@/db/schemas/category.model";

import { db } from "@/db/adapter";
import { categoryModel } from "@/db/schemas";
import { lower } from "@/db/schemas/user.model";

export async function createCategoryRepository(
  categoryPayload: TInsertCategorySchema,
  userId?: string | null | undefined,
) {
  categoryPayload.name = categoryPayload.name.toLowerCase();

  if (userId) {
    const [category] = await db
      .insert(categoryModel)
      .values({
        ...categoryPayload,
        userId,
      })
      .returning();

    return category;
  }

  const [category] = await db
    .insert(categoryModel)
    .values(categoryPayload)
    .returning();

  return category;
}

export async function getAllCategoriesAdmin() {
  return await db.select().from(categoryModel);
}

export async function getAllCategoriesUser(userId: string) {
  return await db
    .select()
    .from(categoryModel)
    .where(or(eq(categoryModel.userId, userId), isNull(categoryModel.userId)));
}

export async function getAdminCategory(categoryIdOrName: string) {
  const [category] = await db
    .select()
    .from(categoryModel)
    .where(
      and(
        or(
          eq(categoryModel.id, categoryIdOrName),
          eq(lower(categoryModel.name), categoryIdOrName.toLowerCase()),
        ),
        isNull(categoryModel.userId),
      ),
    );

  return category;
}

export async function getCategoryRepository(
  categoryIdOrName: string,
  userId?: string,
) {
  const conditions = [
    or(
      eq(categoryModel.id, categoryIdOrName),
      eq(lower(categoryModel.name), categoryIdOrName.toLowerCase()),
    ),
  ];

  // Only add userId condition if userId is provided
  if (userId !== undefined) {
    conditions.push(eq(categoryModel.userId, userId));
  }

  const [category] = await db
    .select()
    .from(categoryModel)
    .where(and(...conditions));

  return category;
}
