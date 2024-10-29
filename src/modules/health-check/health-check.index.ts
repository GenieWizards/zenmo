import { createRouter } from "@/common/lib/create-app.lib";

import * as handlers from "./health-check.handler";
import * as routes from "./health-check.route";

export const healthCheckRouter = createRouter().openapi(
  routes.healthCheck,
  handlers.healthCheck,
);
