import { createRouter } from "@/common/lib/create-app.lib";

import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

export const authRouter = createRouter()
  .openapi(routes.registerRoute, handlers.register)
  .openapi(routes.loginRoute, handlers.login)
  .openapi(routes.logoutRoute, handlers.logout)
  .openapi(routes.loggedinUserDetails, handlers.loggedInUserDetails);
