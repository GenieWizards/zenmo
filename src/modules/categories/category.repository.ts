import { and, asc, desc, eq, isNull, or, sql } from "drizzle-orm";

import type { TInsertCategorySchema } from "@/db/schemas/category.model";

import { db } from "@/db/adapter";
import { categoryModel } from "@/db/schemas";
import { lower } from "@/db/schemas/user.model";

import type { TCategoryQuery } from "./category.schema";

import { categorySortBy } from "./category.util";

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

export async function getAllCategoriesAdminRepository() {
  return await db.select().from(categoryModel);
}

export async function getAllCategoriesUserRepository(
  userId: string,
  queryParams: TCategoryQuery,
) {
  const { page, limit, isActive, sortBy, sortOrder } = queryParams;
  const offset = (page - 1) * limit;
  const whereConditions = [
    or(eq(categoryModel.userId, userId), isNull(categoryModel.userId)),
    eq(categoryModel.isActive, isActive),
  ];
  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(categoryModel)
    .where(and(...whereConditions));

  const sortField = categorySortBy(sortBy);

  const categories = await db
    .select()
    .from(categoryModel)
    .where(and(...whereConditions))
    .limit(limit)
    .offset(offset)
    .orderBy(sortOrder === "desc" ? desc(sortField) : asc(sortField));

  return { totalCount: totalCount[0].count, categories };
}

export async function getAdminCategoryRepository(categoryIdOrName: string) {
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
