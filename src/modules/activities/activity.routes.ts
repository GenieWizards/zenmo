import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { AuthRoles } from "@/common/enums";
import { jsonContent } from "@/common/helpers/json-content.helper";
import {
  authMiddleware,
  checkRoleGuard,
  requireAuth,
} from "@/common/middlewares/auth.middleware";
import { metadataSchema } from "@/common/schema/metadata.schema";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { selectActivitySchema } from "@/db/schemas/activity.model";

import { activityQuerySchema } from "./activity.schema";

const tags = ["Activities"];

export const getActivitiesRoute = createRoute({
  tags,
  method: "get",
  path: "/activities",
  middleware: [authMiddleware()] as const,
  request: {
    query: activityQuerySchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: z.array(selectActivitySchema),
        metadata: metadataSchema,
      }),
      "Activities retrieved successfully",
    ),
  },
});

export const deleteActivityRoute = createRoute({
  tags,
  method: "delete",
  path: "/activities/:activityId",
  middleware: [
    authMiddleware(),
    requireAuth(),
    checkRoleGuard(AuthRoles.ADMIN),
  ] as const,
  request: {
    params: z.object({
      activityId: z.string(),
    }),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectActivitySchema,
      }),
      "Activity deleted successfully",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Activity not found",
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

export type TGetActivitiesRoute = typeof getActivitiesRoute;
export type TDeleteActivityRoute = typeof deleteActivityRoute;
