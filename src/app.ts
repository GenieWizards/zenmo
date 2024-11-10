import { configureOpenAPI } from "./common/lib/configure-open-api.lib";
import { createApp } from "./common/lib/create-app.lib";
import { authRouter } from "./modules/auth/auth.index";
import { healthCheckRouter } from "./modules/health-check/health-check.index";

export const app = createApp();

const routesV1 = [authRouter];

configureOpenAPI(app);

app.route("/api", healthCheckRouter);

routesV1.forEach((route) => {
  app.route("/api/v1", route);
});

app.get("/", (c) => {
  return c.text("Finance Management API!");
});
