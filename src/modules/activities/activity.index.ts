import { createRouter } from "@/common/lib/create-app.lib";

import * as handlers from "./activity.handlers";
import * as routes from "./activity.routes";

export const activityRouter = createRouter().openapi(
  routes.getActivitiesRoute,
  handlers.getActivities,
);
