import { createRoute, z } from "@hono/zod-openapi";

import jsonContentRequired from "@/common/helpers/json-content-required";
import { jsonContent } from "@/common/helpers/json-content.helper";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { insertUserSchema } from "@/db/schemas/user.model";

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
        .omit({ role: true }),
      "User registration details",
    ),
  },
  responses: {
    [HTTPStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: insertUserSchema.extend({
          session: z.string(),
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
    [HTTPStatusCodes.CONFLICT]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
      }),
      "Field already exist(s)",
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

export type RegisterRoute = typeof registerRoute;
