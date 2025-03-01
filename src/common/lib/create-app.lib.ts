import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import env from "@/env";

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

  // built-in middlewares
  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim()),
      // allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
      // allowMethods: ["POST", "GET", "OPTIONS"],
      // exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
      // maxAge: 600,
      credentials: true,
    }),
  );

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
