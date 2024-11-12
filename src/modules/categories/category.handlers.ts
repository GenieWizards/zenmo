import type { AppRouteHandler } from "@/common/lib/types";
import type { TSelectCategorySchema } from "@/db/schemas/category.model";

import { AuthRoles } from "@/common/enums";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import type { TCreateCategoryRoute } from "./category.routes";

import {
  createCategoryRepository,
  getAdminCategory,
  getCategoryRepository,
} from "./category.repository";

export const createCategory: AppRouteHandler<TCreateCategoryRoute> = async (
  c,
) => {
  const user = c.get("user");
  const payload = c.req.valid("json");

  if (!user) {
    return c.json(
      {
        success: false,
        message: "You are not authorized, please login",
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  let categoryExists: TSelectCategorySchema | null = null;

  let category: TSelectCategorySchema | null = null;

  if (user.role !== AuthRoles.USER) {
    categoryExists = await getAdminCategory(payload.name);

    if (categoryExists) {
      return c.json(
        {
          success: false,
          message: "Category already exists",
        },
        HTTPStatusCodes.CONFLICT,
      );
    }

    category = await createCategoryRepository(payload);
  } else {
    categoryExists = await getCategoryRepository(payload.name);

    if (categoryExists) {
      return c.json(
        {
          success: false,
          message: "Category already exists",
        },
        HTTPStatusCodes.CONFLICT,
      );
    }

    category = await createCategoryRepository(payload, user.id);
  }

  if (!category) {
    return c.json(
      {
        success: false,
        message: "Failed to create category",
      },
      HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return c.json(
    {
      success: true,
      message: "Category created successfully",
      data: category,
    },
    HTTPStatusCodes.CREATED,
  );
};
