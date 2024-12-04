import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import jsonContentRequired from "@/common/helpers/json-content-required.helper";
import { jsonContent } from "@/common/helpers/json-content.helper";
import {
  authMiddleware,
  requireAuth,
} from "@/common/middlewares/auth.middleware";
import createErrorSchema from "@/common/schema/create-error.schema";
import {
  AUTHORIZATION_ERROR_MESSAGE,
  FORBIDDEN_ERROR_MESSAGE,
  INTERNAL_SERVER_ERROR_MESSAGE,
  VALIDATION_ERROR_MESSAGE,
} from "@/common/utils/constants";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { insertGroupSchema, selectGroupSchema } from "@/db/schemas/group.model";
import { idSchema } from "@/db/schemas/id.model";

import { groupQuerySchema } from "./group.schema";

const tags = ["Groups"];

export const createGroupRoute = createRoute({
  tags,
  method: "post",
  path: "/groups",
  middleware: [authMiddleware(), requireAuth()] as const,
  request: {
    body: jsonContentRequired(
      insertGroupSchema.omit({
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        creatorId: true,
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
      VALIDATION_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      AUTHORIZATION_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertGroupSchema),
      VALIDATION_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      INTERNAL_SERVER_ERROR_MESSAGE,
    ),
  },
});

export const getAllGroupsRoute = createRoute({
  tags,
  method: "get",
  path: "/groups",
  middleware: [authMiddleware(), requireAuth()] as const,
  request: {
    query: groupQuerySchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: z.array(selectGroupSchema),
      }),
      "List of Groups received successfully",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      AUTHORIZATION_ERROR_MESSAGE,
    ),
  },
});

export const getGroupById = createRoute({
  tags,
  method: "get",
  path: "/group/:id",
  middleware: [authMiddleware(), requireAuth()] as const,
  request: {
    params: z.object({
      id: idSchema,
    }),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectGroupSchema,
      }),
      "Retrieved group data by ID successfully",
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
      AUTHORIZATION_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.FORBIDDEN]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      FORBIDDEN_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      INTERNAL_SERVER_ERROR_MESSAGE,
    ),
  },
});

export const updateGroupRoute = createRoute({
  tags,
  method: "put",
  path: "/group/:id",
  middleware: [authMiddleware(), requireAuth()] as const,
  request: {
    params: z.object({
      id: idSchema,
    }),
    body: jsonContentRequired(
      insertGroupSchema.omit({
        id: true,
        status: true,
        createdAt: true,
        creatorId: true,
      }),
      "Group update",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectGroupSchema,
      }),
      "Group updated successfully",
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
      AUTHORIZATION_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.FORBIDDEN]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      FORBIDDEN_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      INTERNAL_SERVER_ERROR_MESSAGE,
    ),
  },
});

export const deleteGroupRoute = createRoute({
  tags,
  method: "delete",
  path: "groups/:id",
  middleware: [authMiddleware(), requireAuth()] as const,
  request: {
    params: z.object({
      id: idSchema,
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
      AUTHORIZATION_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.FORBIDDEN]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      FORBIDDEN_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      INTERNAL_SERVER_ERROR_MESSAGE,
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
      VALIDATION_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      AUTHORIZATION_ERROR_MESSAGE,
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
      VALIDATION_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      INTERNAL_SERVER_ERROR_MESSAGE,
    ),
  },
});

export type TCreateGroupRoute = typeof createGroupRoute;
export type TGetAllGroupsRoute = typeof getAllGroupsRoute;
export type TGetGroupById = typeof getGroupById;
export type IUpdateGroupRoute = typeof updateGroupRoute;
export type TDeleteGroupRoute = typeof deleteGroupRoute;
export type TAddUsersToGroupRoute = typeof addUsersToGroupRoute;
