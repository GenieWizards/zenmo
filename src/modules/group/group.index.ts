import { createRouter } from "@/common/lib/create-app.lib";

import * as handlers from "./group.handler";
import * as routes from "./group.routes";

export const groupRouters = createRouter()
  .openapi(routes.createGroupRoute, handlers.createGroup)
  .openapi(routes.deleteGroupRoute, handlers.deleteGroup)
  .openapi(routes.addUsersToGroupRoute, handlers.addUsersToGroup);
