import type { AppRouteHandler } from "@/common/lib/types";
import type { TSelectCategorySchema } from "@/db/schemas/category.model";

import { AuthRoles } from "@/common/enums";
import { generateMetadata } from "@/common/helpers/metadata.helper";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import type {
  TCreateCategoryRoute,
  TGetCategoriesRoute,
  TGetCategoryRoute,
} from "./category.routes";

import {
  createCategoryRepository,
  getAdminCategoryRepository,
  getAllCategoriesAdminRepository,
  getAllCategoriesUserRepository,
  getCategoryByIdOrNameRepository,
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
    categoryExists = await getAdminCategoryRepository(payload.name);

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
    categoryExists = await getCategoryRepository(payload.name, user.id);

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

export const getCategories: AppRouteHandler<TGetCategoriesRoute> = async (
  c,
) => {
  const user = c.get("user");
  const queryParams = c.req.valid("query");

  let totalCount: number = 0;
  let categories: TSelectCategorySchema[] | null = null;

  if (user?.role === AuthRoles.USER) {
    const fetchedCategories = await getAllCategoriesUserRepository(
      user?.id,
      queryParams,
    );

    categories = fetchedCategories.categories;
    totalCount = fetchedCategories.totalCount;
  } else {
    categories = await getAllCategoriesAdminRepository();
  }

  const metadata = generateMetadata({
    ...queryParams,
    totalCount,
  });

  return c.json(
    {
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
      metadata,
    },
    HTTPStatusCodes.OK,
  );
};

export const getCategory: AppRouteHandler<TGetCategoryRoute> = async (c) => {
  const user = c.get("user");
  const params = c.req.valid("param");

  const category = await getCategoryByIdOrNameRepository(
    params.category,
    user?.id,
  );

  if (!category) {
    return c.json(
      {
        success: false,
        message: "Category not found",
      },
      HTTPStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    {
      success: true,
      message: "Category retrieved successfully",
      data: category,
    },
    HTTPStatusCodes.OK,
  );
};
