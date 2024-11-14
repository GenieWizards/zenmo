import type { AppRouteHandler } from "@/common/lib/types";
import type { TSelectGroupSchema } from "@/db/schemas/group.model";

import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import type { TCreateGroupRoute } from "./group.routes";

import { createGroupRepository } from "./group.repository";

export const createGroup: AppRouteHandler<TCreateGroupRoute> = async (
  c,
) => {
  const user = c.get("user");
  const payload = c.req.valid("json");

  if (!user) {
    return c.json(
      {
        success: false,
        message: "You are not authorized, please login",
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  let group: TSelectGroupSchema | null = null;
  group = await createGroupRepository(payload);

  if (!group) {
    return c.json(
      {
        success: false,
        message: "Failed to create group",
      },
      HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return c.json(
    {
      success: true,
      message: "Group created successfully",
      data: group,
    },
    HTTPStatusCodes.CREATED,
  );
};
