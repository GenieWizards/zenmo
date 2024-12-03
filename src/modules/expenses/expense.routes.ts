import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import jsonContentRequired from "@/common/helpers/json-content-required.helper";
import { jsonContent } from "@/common/helpers/json-content.helper";
import {
  authMiddleware,
  requireAuth,
} from "@/common/middlewares/auth.middleware";
import createErrorSchema from "@/common/schema/create-error.schema";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import {
  insertExpenseSchema,
  selectExpenseSchema,
} from "@/db/schemas/expense.model";

const tags = ["Expenses"];

export const createExpenseRoute = createRoute({
  tags,
  method: "post",
  path: "/expenses",
  middleware: [
    authMiddleware(),
    requireAuth(),
  ] as const,
  request: {
    body: jsonContentRequired(
      insertExpenseSchema
        .omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true,
        })
        .partial({
          payerId: true,
        }),
      "Expense creation details",
    ),
  },
  responses: {
    [HTTPStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectExpenseSchema,
      }),
      "Expense created successfully",
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
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertExpenseSchema),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Failed to create expense",
    ),
  },
});

export type TCreateExpenseRoute = typeof createExpenseRoute;
