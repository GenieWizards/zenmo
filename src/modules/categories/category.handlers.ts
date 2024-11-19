import type { AppRouteHandler } from "@/common/lib/types";
import type { TSelectCategorySchema } from "@/db/schemas/category.model";

import { ActivityType, AuthRoles } from "@/common/enums";
import { logActivity } from "@/common/helpers/activity-log.helper";
import { generateMetadata } from "@/common/helpers/metadata.helper";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import type {
  TCreateCategoryRoute,
  TDeleteCategoryRoute,
  TGetCategoriesRoute,
  TGetCategoryRoute,
  TUpdateCategoryRoute,
} from "./category.routes";

import {
  createCategoryRepository,
  deleteCategoryByIdRepository,
  getAdminCategoryRepository,
  getAllCategoriesAdminRepository,
  getAllCategoriesUserRepository,
  getCategoryByIdOrNameRepository,
  getCategoryRepository,
  updateCategoryByIdRepository,
} from "./category.repository";

export const createCategory: AppRouteHandler<TCreateCategoryRoute> = async (
  c,
) => {
  const logger = c.get("logger");
  const user = c.get("user");
  const payload = c.req.valid("json");

  if (!user) {
    logger.debug("User is not authorized to create category");
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
      logger.debug("Category already exists");
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
      logger.debug("Category already exists");
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
    logger.error("Failed to create category");
    return c.json(
      {
        success: false,
        message: "Failed to create category",
      },
      HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  void logActivity({
    type: ActivityType.CATEGORY_CREATED,
    metadata: {
      categoryName: category.name,
      actorId: user.id,
      actorName: user.fullName || "",
    },
  });
  logger.debug(`Category created successfully with name ${category.name}`);

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
  const logger = c.get("logger");
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
    const fetchedCategories
      = await getAllCategoriesAdminRepository(queryParams);

    categories = fetchedCategories.categories;
    totalCount = fetchedCategories.totalCount;
  }

  const metadata = generateMetadata({
    ...queryParams,
    totalCount,
  });

  logger.info("Categories retrieved successfully");
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
  const logger = c.get("logger");
  const user = c.get("user");
  const params = c.req.valid("param");

  let category: TSelectCategorySchema | null = null;

  if (user?.role !== AuthRoles.USER) {
    category = await getCategoryByIdOrNameRepository(params.category);
  } else {
    category = await getCategoryByIdOrNameRepository(params.category, user?.id);
  }

  if (!category) {
    logger.debug("Category not found");
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

export const updateCategory: AppRouteHandler<TUpdateCategoryRoute> = async (
  c,
) => {
  const logger = c.get("logger");
  const user = c.get("user");
  const { categoryId } = c.req.valid("param");
  const payload = c.req.valid("json");

  const category = await getCategoryRepository(categoryId);

  if (!category) {
    logger.error(`Category with id ${categoryId} not found`);
    return c.json(
      {
        success: false,
        message: "Category not found",
      },
      HTTPStatusCodes.NOT_FOUND,
    );
  }

  if (user?.role !== AuthRoles.ADMIN && category.userId !== user?.id) {
    logger.error(
      `User ${user?.id} not authorized to update category ${categoryId}`,
    );
    return c.json(
      {
        success: false,
        message: "You are not authorized to update this category",
      },
      HTTPStatusCodes.FORBIDDEN,
    );
  }

  const updatedCategory = await updateCategoryByIdRepository(
    categoryId,
    payload,
  );

  if (!updatedCategory) {
    logger.error("Failed to update category");
    return c.json(
      {
        success: false,
        message: "Failed to update category",
      },
      HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  logger.info(
    `Category updated successfully with name ${updatedCategory.name}`,
  );
  return c.json(
    {
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    },
    HTTPStatusCodes.OK,
  );
};

export const deleteCategory: AppRouteHandler<TDeleteCategoryRoute> = async (
  c,
) => {
  const logger = c.get("logger");
  const user = c.get("user");
  const { categoryId } = c.req.valid("param");

  const category = await getCategoryRepository(categoryId);

  if (!category) {
    logger.error(`Category with id ${categoryId} not found`);
    return c.json(
      {
        success: false,
        message: "Category not found",
      },
      HTTPStatusCodes.NOT_FOUND,
    );
  }

  if (user?.role !== AuthRoles.ADMIN && category.userId !== user?.id) {
    logger.error(
      `User ${user?.id} not authorized to delete category ${categoryId}`,
    );
    return c.json(
      {
        success: false,
        message: "You are not authorized to delete this category",
      },
      HTTPStatusCodes.FORBIDDEN,
    );
  }

  const deletedCategory = await deleteCategoryByIdRepository(categoryId);

  if (!deletedCategory) {
    logger.error("Failed to delete category");
    return c.json(
      {
        success: false,
        message: "Failed to delete category",
      },
      HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  logger.info(`Category with id ${categoryId} deleted successfully`);
  return c.json(
    {
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    },
    HTTPStatusCodes.OK,
  );
};
