import { createRoute, z } from "@hono/zod-openapi";

import jsonContentRequired from "@/common/helpers/json-content-required";
import { jsonContent } from "@/common/helpers/json-content.helper";
import { notFoundSchema } from "@/common/lib/constants.lib";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { insertUserSchema } from "@/db/schemas/user.schema";

import { betterAuthSessionSchema, betterAuthUserSchema } from "./auth.schema";

const tags = ["Auth"];

export const session = createRoute({
  tags,
  method: "get",
  path: "/auth/session",
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        data: z.object({
          user: betterAuthUserSchema,
          session: betterAuthSessionSchema,
        }),
      }),
      "Get logged in user details",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "User not found",
    ),
  },
});
export type SessionRoute = typeof session;

export const login = createRoute({
  tags,
  method: "post",
  path: "/auth/login",
  request: {
    body: jsonContentRequired(
      insertUserSchema.pick({ email: true, password: true }).required({ password: true }),
      "User login details",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: betterAuthSessionSchema,
      }).optional(),
      "User logged in successfully",
    ),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
      }),
      "Invalid email or password",
    ),
  },
});
export type LoginRoute = typeof login;

export const register = createRoute({
  tags,
  method: "post",
  path: "/auth/register",
  request: {
    body: jsonContentRequired(
      insertUserSchema,
      "User registration details",
    ),
  },
  responses: {
    [HTTPStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.object({
          user: betterAuthSessionSchema,
        }),
      }),
      "User created successfully",
    ),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
      }),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
      }),
      "Server side error(s)",
    ),
  },
});
export type RegisterRoute = typeof register;
