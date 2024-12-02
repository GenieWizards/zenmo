import { ActivityType } from "@/common/enums";
import { logActivity } from "@/common/helpers/activity-log.helper";
import type { AppRouteHandler } from "@/common/lib/types";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import type { TSelectGroupSchema } from "@/db/schemas/group.model";

import {
  addUsersToGroupRepository,
  createGroupRepository,
  deleteGroupRepository,
  getGroupByIdRepository,
} from "./group.repository";
import type {
  TAddUsersToGroupRoute,
  TCreateGroupRoute,
  TDeleteGroupRoute,
} from "./group.routes";

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
      action: "create",
      resourceType: "group",
      resourceName: group.name,
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
      action: "delete",
      resourceType: "group",
      resourceName: deletedGroup.name,
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

export const addUsersToGroup: AppRouteHandler<TAddUsersToGroupRoute> = async (
  c,
) => {
  const user = c.get("user");
  const payload = c.req.valid("json");
  const params = c.req.valid("param");
  const logger = c.get("logger");

  logger.debug(params, "GroupId");

  if (!user) {
    logger.error("User is not authorized");
    return c.json(
      {
        success: false,
        message: "You are not authorized, please login",
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  const { userIds, usernames } = payload;
  const { groupId } = params;

  const groupExists = await getGroupByIdRepository(groupId);

  if (!groupExists) {
    logger.error(`Group with ${groupId} not found`);
    return c.json(
      {
        success: false,
        message: `Group with ${groupId} not found`,
      },
      HTTPStatusCodes.NOT_FOUND,
    );
  }

  const addUsersToGroupResp = await addUsersToGroupRepository(groupId, userIds);

  if (!addUsersToGroupResp) {
    logger.error("Failed to add users to group");
    return c.json(
      {
        success: false,
        message: "Failed to add users to group",
      },
      HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  void logActivity({
    type: ActivityType.GROUP_MEMBER_ADDED,
    metadata: {
      action: "update",
      resourceType: "group",
      resourceName: groupExists.name,
      actorId: user.id,
      actorName: user.fullName || "",
      targetId: userIds.join(", "),
      targetName: usernames.join(", "),
    },
  });

  logger.debug("Users added to group successfully");
  return c.json(
    {
      success: true,
      message: "Users added to group successfully",
      data: groupExists,
    },
    HTTPStatusCodes.OK,
  );
};
