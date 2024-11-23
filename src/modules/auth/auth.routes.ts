import { createRoute, z } from "@hono/zod-openapi";

import jsonContentRequired from "@/common/helpers/json-content-required.helper";
import { jsonContent } from "@/common/helpers/json-content.helper";
import {
  authMiddleware,
  requireAuth,
} from "@/common/middlewares/auth.middleware";
import createErrorSchema from "@/common/schema/create-error.schema";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { insertUserSchema, selectUserSchema } from "@/db/schemas/user.model";

const tags = ["Auth"];

export const registerRoute = createRoute({
  tags,
  method: "post",
  path: "/auth/register",
  request: {
    body: jsonContentRequired(
      insertUserSchema
        .extend({
          password: z.string().min(8).max(60),
        })
        .omit({
          role: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          id: true,
        }),
      "User registration details",
    ),
  },
  responses: {
    [HTTPStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: insertUserSchema.extend({
          session: z.string(),
        }),
      }),
      "User created successfully",
    ),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.CONFLICT]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Field already exist(s)",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(
        insertUserSchema.extend({
          password: z.string().min(8).max(60),
        }),
      ),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Server side error(s)",
    ),
  },
});

export const loginRoute = createRoute({
  tags,
  method: "post",
  path: "/auth/login",
  request: {
    body: jsonContentRequired(
      insertUserSchema
        .extend({
          password: z.string().min(8).max(60),
        })
        .omit({
          role: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          id: true,
          fullName: true,
        }),
      "User registration details",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: insertUserSchema.extend({
          session: z.string(),
        }),
      }),
      "User logged in successfully",
    ),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Server side error(s)",
    ),
  },
});

export const logoutRoute = createRoute({
  tags,
  method: "post",
  path: "/auth/logout",
  middleware: [authMiddleware(), requireAuth()] as const,
  responses: {
    [HTTPStatusCodes.NO_CONTENT]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
      }),
      "User logged out successfully",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not authorized, please login",
    ),
  },
});

export const loggedinUserDetails = createRoute({
  tags,
  method: "get",
  path: "/auth/me",
  middleware: [authMiddleware(), requireAuth()] as const,
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectUserSchema,
      }),
      "Logged in user details",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not authorized, please login",
    ),
  },
});

export type TRegisterRoute = typeof registerRoute;
export type TLoginRoute = typeof loginRoute;
export type TLogoutRoute = typeof logoutRoute;
export type TLoggedInUserDetails = typeof loggedinUserDetails;
