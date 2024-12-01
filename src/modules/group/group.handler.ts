import { ActivityType } from "@/common/enums";
import { logActivity } from "@/common/helpers/activity-log.helper";
import type { AppRouteHandler } from "@/common/lib/types";
import { generateMetadata } from "@/common/helpers/metadata.helper";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import type { TSelectGroupSchema, TGetAllGroupsRoute } from "@/db/schemas/group.model";

import {
  createGroupRepository,
  deleteGroupRepository,
  getAllGroupsRepository,
} from "./group.repository";
import type { TCreateGroupRoute, TDeleteGroupRoute } from "./group.routes";

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

export const getAllGroups: AppRouteHandler<TGetAllGroupsRoute> = async (c) => {
  const user = c.get("user");
  const query = c.req.valid("query");
  const logger = c.get("logger");

  if (!user) {
    logger.error("User is not authorized to access group data");
    return c.json(
      {
        success: false,
        message: "You are not authorized, please login",
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  const fetchedGroups = await getAllGroupsRepository(query, user);
  const totalCount: number = fetchedGroups.totalCount;
  const groups: TSelectGroupSchema[] | null = fetchedGroups.groups;

  const metadata = generateMetadata({
    ...query,
    totalCount,
  });

  logger.info("Groups data received successfully");
  return c.json(
    {
      success: true,
      message: "List of groups received successfully",
      data: groups,
      metadata,
    },
    HTTPStatusCodes.OK,
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
