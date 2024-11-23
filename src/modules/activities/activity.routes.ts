import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { jsonContent } from "@/common/helpers/json-content.helper";
import {
  authMiddleware,
  requireAuth,
} from "@/common/middlewares/auth.middleware";
import createErrorSchema from "@/common/schema/create-error.schema";
import { metadataSchema } from "@/common/schema/metadata.schema";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import { activityQuerySchema } from "./activity.schema";

const tags = ["Activities"];

export const getActivitiesRoute = createRoute({
  tags,
  method: "get",
  path: "/activities",
  middleware: [authMiddleware(), requireAuth()] as const,
  request: {
    query: activityQuerySchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: z.array(
          z.object({
            id: z.string(),
            message: z.string(),
          }),
        ),
        metadata: metadataSchema,
      }),
      "Categories retrieved successfully",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not authorized, please login",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(activityQuerySchema),
      "The validation error(s)",
    ),
  },
});

export type TGetActivitiesRoute = typeof getActivitiesRoute;
