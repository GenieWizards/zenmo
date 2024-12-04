import { OpenAPIHono } from "@hono/zod-openapi";

import {
  notFoundMiddleware,
  onErrorMiddleware,
  pinoLogger,
  serveEmojiFavicon,
} from "../middlewares";
import { defaultHook } from "../utils/default-hook.util";
import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export function createApp() {
  const app = createRouter();

  app.use(pinoLogger());
  app.use(serveEmojiFavicon("🔥"));

  // global middlewares
  app.notFound(notFoundMiddleware);
  app.onError(onErrorMiddleware);

  return app;
}

export function createTestApp(router: AppOpenAPI) {
  const testApp = createApp();

  testApp.route("/", router);

  return testApp;
}
