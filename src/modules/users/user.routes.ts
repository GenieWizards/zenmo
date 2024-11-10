import { createRoute, z } from "@hono/zod-openapi";

import jsonContentRequired from "@/common/helpers/json-content-required";
import { jsonContent } from "@/common/helpers/json-content.helper";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { insertUserSchema, selectUserSchema } from "@/db/schemas/user.model";

const tags = ["Users"];

export const createUser = createRoute({
  tags,
  method: "post",
  path: "/users",
  request: {
    body: jsonContentRequired(
      insertUserSchema.extend({
        password: z.string().min(8).max(60),
      }),
      "User registration details",
    ),
  },
  responses: {
    [HTTPStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: selectUserSchema,
      }),
      "User created successfully",
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

export type CreateUserRoute = typeof createUser;
