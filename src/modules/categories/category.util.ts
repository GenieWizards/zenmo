import { sql } from "drizzle-orm";

import { categoryModel } from "@/db/schemas";
import type { TInsertCategorySchema } from "@/db/schemas/category.model";

export function categorySortBy(sortBy: string | undefined) {
  if (sortBy === "name") {
    return categoryModel.name;
  } else if (sortBy === "updatedAt") {
    return categoryModel.updatedAt;
  } else {
    return categoryModel.createdAt;
  }
}

/**
 * Creates a PostgreSQL full-text search query for category search
 *
 * @param search - The search term to query against category name and description
 * @returns SQL query fragment for PostgreSQL full-text search with weighted ranking
 *
 * @description
 * - Uses `plainto_tsquery` when search contains 'and' for exact phrase matching
 * - Uses `to_tsquery` with `:*` suffix for partial word matches
 * - Weights category name (A) higher than description (B) in search results
 *
 * @example
 * // Simple search (partial match)
 * categoryFullTextSearch('food') // matches: food, foods, foodie, etc.
 *
 * // AND condition (exact phrase)
 * categoryFullTextSearch('food and drinks') // matches exact phrase "food and drinks"
 */
export function categoryFullTextSearch(search: string) {
  const containsAndOr = search.includes("and") || search.includes("or");
  const modifiedSearch = containsAndOr ? search : `${search}:*`;
  const searchQuery = containsAndOr
    ? sql`plainto_tsquery('english', ${modifiedSearch})`
    : sql`to_tsquery('english', ${modifiedSearch})`;

  const data = sql`(
    setweight(to_tsvector('english', ${categoryModel.name}), 'A') ||
    setweight(to_tsvector('english', ${categoryModel.description}), 'B'))
    @@ ${searchQuery}
  `;

  return data;
}

/**
 * Check if category either belongs to user or should not have any user assigned(global).
 */
export function isCategoryValidForUser(category: TInsertCategorySchema, userId: string) {
  if (category.userId === userId || !category.userId) {
    return true;
  } else {
    return false;
  }
}
