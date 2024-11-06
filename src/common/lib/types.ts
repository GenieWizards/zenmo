import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";

import type { auth } from "./auth";

type AuthSession = typeof auth.$Infer.Session.session;
type AuthUser = typeof auth.$Infer.Session.user;

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    user: AuthSession | null;
    session: AuthUser | null;
  };
};

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;

export type ZodSchema =
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  z.ZodUnion | z.AnyZodObject | z.ZodArray<z.AnyZodObject>;
