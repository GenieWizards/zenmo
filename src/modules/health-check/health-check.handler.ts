import type { AppRouteHandler } from "@/common/lib/types";

import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import type { HealthCheckRoute } from "./health-check.route";

export const healthCheck: AppRouteHandler<HealthCheckRoute> = (c) => {
  return c.json(
    {
      success: true,
      message: "Finance Management API is up and running!!!",
    },
    HTTPStatusCodes.OK,
  );
};
