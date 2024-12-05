import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";

import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import type { AuthRole } from "../enums";
import {
  AUTHORIZATION_ERROR_MESSAGE,
  FORBIDDEN_ERROR_MESSAGE,
} from "../utils/constants";
import { validateSessionToken } from "../utils/sessions.util";

export function authMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const sessionId
      = c.req.header("session") || getCookie(c, "session") || null;

    if (!sessionId) {
      c.set("user", null);
      c.set("session", null);

      return next();
    }

    const { session, user } = await validateSessionToken(sessionId);

    if (!session) {
      c.set("user", null);
      c.set("session", null);

      return next();
    }

    c.set("user", user);
    c.set("session", session);

    return await next();
  };
}

export function requireAuth(): MiddlewareHandler {
  return async (c, next) => {
    if (!c.get("user")) {
      return c.json(
        {
          success: false,
          message: AUTHORIZATION_ERROR_MESSAGE,
        },
        HTTPStatusCodes.UNAUTHORIZED,
      );
    }

    return await next();
  };
}

export function checkRoleGuard(...allowedRoles: AuthRole[]): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          success: false,
          message: AUTHORIZATION_ERROR_MESSAGE,
        },
        HTTPStatusCodes.UNAUTHORIZED,
      );
    }

    if (!user.role) {
      return c.json(
        {
          success: false,
          message: FORBIDDEN_ERROR_MESSAGE,
        },
        HTTPStatusCodes.FORBIDDEN,
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          success: false,
          message: FORBIDDEN_ERROR_MESSAGE,
        },
        HTTPStatusCodes.FORBIDDEN,
      );
    }

    await next();
  };
}
