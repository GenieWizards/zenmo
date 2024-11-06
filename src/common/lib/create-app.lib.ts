import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import env from "@/env";

import type { AppBindings } from "./types";

import {
  notFoundMiddleware,
  onErrorMiddleware,
  pinoLogger,
  serveEmojiFavicon,
} from "../middlewares";
import { defaultHook } from "../utils/default-hook.util";

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

  app.use(
    "*", // or replace with "*" to enable cors for all routes
    cors({
      origin: [env.CLIENT_URL], // replace with your origin
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS", "PUT", "PATCH", "DELETE"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  );

  // global middlewares
  app.notFound(notFoundMiddleware);
  app.onError(onErrorMiddleware);

  return app;
}
