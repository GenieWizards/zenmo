import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";

import type { TSelectSessionSchema } from "@/db/schemas/session.model";
import type { TSelectUserSchema } from "@/db/schemas/user.model";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    user: TSelectUserSchema | null;
    session: TSelectSessionSchema | null;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;

export type ZodSchema =
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  z.ZodUnion | z.AnyZodObject | z.ZodArray<z.AnyZodObject>;
