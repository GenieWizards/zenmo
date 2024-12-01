import { createRouter } from "@/common/lib/create-app.lib";

import * as handlers from "./group.handler";
import * as routes from "./group.routes";

export const groupRouters = createRouter()
  .openapi(routes.createGroupRoute, handlers.createGroup)
  .openapi(routes.getAllGroupsRoute, handlers.getAllGroups)
  .openapi(routes.updateGroupRoute, handlers.updateGroup)
  .openapi(routes.deleteGroupRoute, handlers.deleteGroup);
