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
import createErrorSchema from "@/common/schema/create-error.schema";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { insertGroupSchema, selectGroupSchema } from "@/db/schemas/group.model";

const tags = ["Groups"];

export const createGroupRoute = createRoute({
  tags,
  method: "post",
  path: "/groups",
  middleware: [
    authMiddleware(),
    requireAuth(),
    checkRoleGuard(AuthRoles.ADMIN, AuthRoles.USER),
  ] as const,
  request: {
    body: jsonContentRequired(
      insertGroupSchema.omit({
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }),
      "Group creation",
    ),
  },
  responses: {
    [HTTPStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectGroupSchema,
      }),
      "Group created successfully",
    ),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Validation error(s)",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not authorized, please login",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertGroupSchema),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Failed to create the group",
    ),
  },
});

export const deleteGroupRoute = createRoute({
  tags,
  method: "delete",
  path: "groups/:id",
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
      }),
      "Group deleted successfully",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Group with id does not exist",
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
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Something went wrong, please try again later",
    ),
  },
});

export const addUsersToGroupRoute = createRoute({
  tags,
  method: "post",
  path: "/groups/:groupId/users",
  middleware: [authMiddleware(), requireAuth()] as const,
  request: {
    body: jsonContentRequired(
      z.array(
        z.object({
          userId: z.string().min(32).max(60),
          username: z.string().min(3).max(100),
        }),
      ),
      "Group creation",
    ),
    params: z.object({
      groupId: z.string().min(32).max(60),
    }),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectGroupSchema,
      }),
      "Group created successfully",
    ),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Validation error(s)",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not authorized, please login",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Group with id does not exist",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertGroupSchema),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Failed to add user(s) to the group",
    ),
  },
});

export type TCreateGroupRoute = typeof createGroupRoute;
export type TDeleteGroupRoute = typeof deleteGroupRoute;
export type TAddUsersToGroupRoute = typeof addUsersToGroupRoute;
