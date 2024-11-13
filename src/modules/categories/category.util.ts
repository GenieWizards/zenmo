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
