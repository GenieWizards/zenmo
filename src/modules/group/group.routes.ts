import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { AuthRoles } from "@/common/enums";
import jsonContentRequired from "@/common/helpers/json-content-required.helper";
import { jsonContent } from "@/common/helpers/json-content.helper";
import { authMiddleware, checkRoleGuard, requireAuth } from "@/common/middlewares/auth.middleware";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { insertGroupSchema, selectGroupSchema } from "@/db/schemas/group.model";

const tags = ["Groups"];

export const createGroupRoute = createRoute({
  tags,
  method: "post",
  path: "/groups",
  middleware: [
    authMiddleware(),
    requireAuth(),
    checkRoleGuard(AuthRoles.ADMIN, AuthRoles.USER),
  ] as const,
  request: {
    body: jsonContentRequired(
      insertGroupSchema.omit({
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }),
      "Group creation",
    ),
  },
  responses: {
    [HTTPStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.boolean().default(true),
        message: z.string(),
        data: selectGroupSchema,
      }),
      "Group created successfully",
    ),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Validation error(s)",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "You are not authorized, please login",
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "Failed to create the group",
    ),
  },
});

export type TCreateGroupRoute = typeof createGroupRoute;
