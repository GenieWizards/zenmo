import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { jsonContent } from "@/common/helpers/json-content.helper";
import { authMiddleware } from "@/common/middlewares/auth.middleware";
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

export type TGetActivitiesRoute = typeof getActivitiesRoute;
