import { configureOpenAPI } from "./common/lib/configure-open-api.lib";
import { createApp } from "./common/lib/create-app.lib";
import { healthCheckRouter } from "./modules/health-check/health-check.index";

export const app = createApp();

const routes = [healthCheckRouter];

configureOpenAPI(app);

routes.forEach((route) => {
  app.route("/", route);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
