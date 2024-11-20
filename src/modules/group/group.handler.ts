import type { AppRouteHandler } from "@/common/lib/types";
import type { TSelectGroupSchema } from "@/db/schemas/group.model";

import { ActivityType } from "@/common/enums";
import { logActivity } from "@/common/helpers/activity-log.helper";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import type { TCreateGroupRoute, TDeleteGroupRoute } from "./group.routes";

import {
  createGroupRepository,
  deleteGroupRepository,
} from "./group.repository";

export const createGroup: AppRouteHandler<TCreateGroupRoute> = async (c) => {
  const user = c.get("user");
  const payload = c.req.valid("json");
  const logger = c.get("logger");

  if (!user) {
    logger.error("User is not authorized to create group");
    return c.json(
      {
        success: false,
        message: "You are not authorized, please login",
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  payload.creatorId = user.id;

  const group: TSelectGroupSchema | null = await createGroupRepository(payload);

  if (!group) {
    logger.error("Failed to create group");
    return c.json(
      {
        success: false,
        message: "Failed to create group",
      },
      HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  void logActivity({
    type: ActivityType.GROUP_CREATED,
    metadata: {
      groupName: group.name,
      actorId: user.id,
      actorName: user.fullName || "",
    },
  });
  logger.debug(`Group created successfully with name ${group.name}`);

  return c.json(
    {
      success: true,
      message: "Group created successfully",
      data: group,
    },
    HTTPStatusCodes.CREATED,
  );
};

export const deleteGroup: AppRouteHandler<TDeleteGroupRoute> = async (c) => {
  const user = c.get("user");
  const params = c.req.valid("param");
  const logger = c.get("logger");

  if (!user) {
    logger.error("User is not authorized to delete group");
    return c.json(
      {
        success: false,
        message: "You are not authorized, please login",
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  const deletedGroup = await deleteGroupRepository(params.id);

  if (!deletedGroup) {
    logger.error(`Group with ${params.id} not found`);
    return c.json(
      {
        success: false,
        message: `Group with ${params.id} not found`,
      },
      HTTPStatusCodes.NOT_FOUND,
    );
  }

  void logActivity({
    type: ActivityType.GROUP_DELETED,
    metadata: {
      groupName: deletedGroup.name,
      actorId: user.id,
      actorName: user.fullName || "",
    },
  });
  logger.debug(`Group ${deletedGroup.name} deleted successfully`);

  return c.json(
    {
      success: true,
      message: `Group ${deletedGroup.name} deleted successfully`,
    },
    HTTPStatusCodes.OK,
  );
};
