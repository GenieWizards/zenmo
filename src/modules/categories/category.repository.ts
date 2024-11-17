import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";

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

export async function getAllCategoriesAdminRepository(
  queryParams: TCategoryQuery,
) {
  const { page, limit, isActive, sortBy, sortOrder, search } = queryParams;
  const offset = (page - 1) * limit;
  const whereConditions: SQL<unknown>[] = [];

  if (search) {
    whereConditions.push(
      ilike(categoryModel.name, `%${search.toLowerCase()}%`),
    );
  }

  if (isActive !== undefined) {
    whereConditions.push(eq(categoryModel.isActive, isActive));
  }

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

  return {
    totalCount: totalCount[0].count,
    categories,
  };
}

export async function getAllCategoriesUserRepository(
  userId: string,
  queryParams: TCategoryQuery,
) {
  const {
    page,
    limit,
    isActive = true,
    sortBy,
    sortOrder,
    search,
  } = queryParams;
  const offset = (page - 1) * limit;
  const whereConditions = [
    or(eq(categoryModel.userId, userId), isNull(categoryModel.userId)),
    eq(categoryModel.isActive, isActive),
  ];

  if (search) {
    whereConditions.push(
      ilike(categoryModel.name, `%${search.toLowerCase()}%`),
    );
  }

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
  userId?: string | undefined,
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

export async function getCategoryByIdOrNameRepository(
  categoryIdOrName: string,
  userId?: string | undefined,
) {
  const conditions = [
    or(
      eq(categoryModel.id, categoryIdOrName),
      eq(lower(categoryModel.name), categoryIdOrName.toLowerCase()),
    ),
  ];

  // Only add userId condition if userId is provided
  if (userId !== undefined) {
    const [category] = await db
      .select()
      .from(categoryModel)
      .where(
        and(
          ...conditions,
          or(eq(categoryModel.userId, userId), isNull(categoryModel.userId)),
        ),
      );

    return category;
  }

  const [category] = await db
    .select()
    .from(categoryModel)
    .where(or(...conditions, isNull(categoryModel.userId)));

  return category;
}

export async function updateCategoryByIdRepository(
  categoryId: string,
  categoryPayload: Partial<TInsertCategorySchema>,
) {
  const whereCondition = [eq(categoryModel.id, categoryId)];

  categoryPayload.name = categoryPayload?.name?.toLowerCase();
  categoryPayload.updatedAt = new Date();

  const [category] = await db
    .update(categoryModel)
    .set(categoryPayload)
    .where(and(...whereCondition))
    .returning();

  return category;
}

export async function deleteCategoryByIdRepository(categoryId: string) {
  const [category] = await db
    .delete(categoryModel)
    .where(eq(categoryModel.id, categoryId))
    .returning();

  return category;
}
