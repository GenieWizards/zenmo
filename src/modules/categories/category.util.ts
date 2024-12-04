import type { TInsertCategorySchema } from "@/db/schemas/category.model";

import { categoryModel } from "@/db/schemas";

export function categorySortBy(sortBy: string | undefined) {
  if (sortBy === "name") {
    return categoryModel.name;
  } else if (sortBy === "updatedAt") {
    return categoryModel.updatedAt;
  } else {
    return categoryModel.createdAt;
  }
}

// either category belongs to user or should not have any user assigned.
export function isCategoryValidForUser(category: TInsertCategorySchema, userId: string) {
  if (category.userId === userId || !category.userId) {
    return true;
  } else {
    return false;
  }
}
