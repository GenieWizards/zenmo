import { createRouter } from "@/common/lib/create-app.lib";

import * as handlers from "./auth.handler";
import * as routes from "./auth.route";

export const authRouter = createRouter().openapi(
  routes.session,
  handlers.session,
).openapi(
  routes.register,
  handlers.register,
);
