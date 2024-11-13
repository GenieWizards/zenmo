import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { AuthRoles } from "@/common/enums";
import jsonContentRequired from "@/common/helpers/json-content-required.helper";
import { jsonContent } from "@/common/helpers/json-content.helper";
import {
  authMiddleware,
  checkRoleGuard,
  requireAuth,
} from "@/common/middlewares/auth.middleware";
import { metadataSchema } from "@/common/schema/metadata.schema";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import {
  insertCategorySchema,
  selectCategorySchema,
} from "@/db/schemas/category.model";

import { categoryQuerySchema } from "./category.schema";

const tags = ["Categories"];

export const createCategoryRoute = createRoute({
  tags,
  method: "post",
  path: "/categories",
  middleware: [
    authMiddleware(),
    requireAuth(),
    checkRoleGuard(AuthRoles.ADMIN, AuthRoles.USER),
  ] as const,
  request: {
    body: jsonContentRequired(
      insertCategorySchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      }),
      "Category creation details",
    ),
  },
  responses: {
    [HTTPStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectCategorySchema,
      }),
      "Category created successfully",
    ),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not authorized, please login",
    ),
    [HTTPStatusCodes.CONFLICT]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Category already exists",
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Failed to create category",
    ),
  },
});

export const getCategoriesRoute = createRoute({
  tags,
  method: "get",
  path: "/categories",
  middleware: [authMiddleware()] as const,
  request: {
    query: categoryQuerySchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: z.array(selectCategorySchema),
        metadata: metadataSchema,
      }),
      "Categories retrieved successfully",
    ),
  },
});

export const getCategoryRoute = createRoute({
  tags,
  method: "get",
  path: "/categories/:id",
  middleware: [authMiddleware()] as const,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectCategorySchema,
      }),
      "Category retrieved successfully",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Category not found",
    ),
  },
});

export const updateCategoryRoute = createRoute({
  tags,
  method: "put",
  path: "/categories/:id",
  middleware: [
    authMiddleware(),
    requireAuth(),
    checkRoleGuard(AuthRoles.ADMIN, AuthRoles.USER),
  ] as const,
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: jsonContentRequired(
      insertCategorySchema
        .omit({
          id: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        })
        .partial(),
      "Category update details",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectCategorySchema,
      }),
      "Category updated successfully",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Category not found",
    ),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not authorized, please login",
    ),
    [HTTPStatusCodes.FORBIDDEN]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not allowed to perform this action",
    ),
  },
});

export const deleteCategoryRoute = createRoute({
  tags,
  method: "delete",
  path: "/categories/:id",
  middleware: [
    authMiddleware(),
    requireAuth(),
    checkRoleGuard(AuthRoles.ADMIN, AuthRoles.USER),
  ] as const,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectCategorySchema,
      }),
      "Category deleted successfully",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Category not found",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not authorized, please login",
    ),
    [HTTPStatusCodes.FORBIDDEN]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not allowed to perform this action",
    ),
  },
});

export type TCreateCategoryRoute = typeof createCategoryRoute;
export type TGetCategoriesRoute = typeof getCategoriesRoute;
export type TGetCategoryRoute = typeof getCategoryRoute;
export type TUpdateCategoryRoute = typeof updateCategoryRoute;
export type TDeleteCategoryRoute = typeof deleteCategoryRoute;
