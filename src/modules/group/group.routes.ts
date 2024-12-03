import jsonContentRequired from "@/common/helpers/json-content-required.helper";
import { jsonContent } from "@/common/helpers/json-content.helper";
import {
  authMiddleware,
  requireAuth,
} from "@/common/middlewares/auth.middleware";
import createErrorSchema from "@/common/schema/create-error.schema";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { insertGroupSchema, selectGroupSchema } from "@/db/schemas/group.model";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { groupQuerySchema } from "./group.schema";

const tags = ["Groups"];

export const createGroupRoute = createRoute({
  tags,
  method: "post",
  path: "/group",
  middleware: [
    authMiddleware(),
    requireAuth(),
  ] as const,
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

export const getAllGroupsRoute = createRoute({
  tags,
  method: "get",
  path: "/groups",
  middleware: [
    authMiddleware(),
    requireAuth(),
  ] as const,
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
      "You are not authorized, please login",
    ),
  },
});

export const getGroupById = createRoute({
  tags,
  method: "get",
  path: "/group/:id",
  middleware: [
    authMiddleware(),
    requireAuth(),
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

export const updateGroupRoute = createRoute({
  tags,
  method: "put",
  path: "/group/:id",
  middleware: [
    authMiddleware(),
    requireAuth(),
  ] as const,
  request: {
    params: z.object({
      id: z.string(),
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

export const deleteGroupRoute = createRoute({
  tags,
  method: "delete",
  path: "group/:id",
  middleware: [
    authMiddleware(),
    requireAuth(),
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

export type TCreateGroupRoute = typeof createGroupRoute;
export type TGetAllGroupsRoute = typeof getAllGroupsRoute;
export type TGetGroupById = typeof getGroupById;
export type IUpdateGroupRoute = typeof updateGroupRoute;
export type TDeleteGroupRoute = typeof deleteGroupRoute;
