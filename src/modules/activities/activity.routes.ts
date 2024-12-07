import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { jsonContent } from "@/common/helpers/json-content.helper";
import {
  authMiddleware,
  requireAuth,
} from "@/common/middlewares/auth.middleware";
import createErrorSchema from "@/common/schema/create-error.schema";
import { metadataSchema } from "@/common/schema/metadata.schema";
import { AUTHORIZATION_ERROR_MESSAGE, VALIDATION_ERROR_MESSAGE } from "@/common/utils/constants";
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
      AUTHORIZATION_ERROR_MESSAGE,
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(activityQuerySchema),
      VALIDATION_ERROR_MESSAGE,
    ),
  },
});

export type TGetActivitiesRoute = typeof getActivitiesRoute;
