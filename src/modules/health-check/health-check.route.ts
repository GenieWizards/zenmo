import { createRoute } from "@hono/zod-openapi";

import { jsonContent } from "@/common/helpers/json-content.helper";
import { createMessageObjectSchema } from "@/common/schema/create-message-object.schema";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

export const healthCheck = createRoute({
  tags: ["Health Check"],
  method: "get",
  path: "/health-check",
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("Hello Hono!"),
      "Health Check API",
    ),
  },
});

export type HealthCheckRoute = typeof healthCheck;
