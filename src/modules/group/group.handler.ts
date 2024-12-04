import { ActivityType, AuthRoles } from "@/common/enums";
import { logActivity } from "@/common/helpers/activity-log.helper";
import { generateMetadata } from "@/common/helpers/metadata.helper";
import type { AppRouteHandler } from "@/common/lib/types";
import { AUTHORIZATION_ERROR_MESSAGE } from "@/common/utils/constants";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import type { TSelectGroupSchema } from "@/db/schemas/group.model";

import {
  addUsersToGroupRepository,
  createGroupRepository,
  deleteGroupRepository,
  getAllGroupsRepository,
  getGroupByIdRepository,
  updateGroupRepository,
} from "./group.repository";
import type {
  IUpdateGroupRoute,
  TAddUsersToGroupRoute,
  TCreateGroupRoute,
  TDeleteGroupRoute,
  TGetAllGroupsRoute,
  TGetGroupById,
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
        message: AUTHORIZATION_ERROR_MESSAGE,
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  const group: TSelectGroupSchema | null = await createGroupRepository({
    ...payload,
    creatorId: user.id,
  });

  if (!group) {
    logger.error("Failed to create group due to internal error");
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
        message: AUTHORIZATION_ERROR_MESSAGE,
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  const fetchedGroups = await getAllGroupsRepository(query, user);

  const metadata = generateMetadata({
    ...query,
    totalCount: fetchedGroups.totalCount,
  });

  logger.info("Groups data received successfully");
  return c.json(
    {
      success: true,
      message: "List of groups received successfully",
      data: fetchedGroups.groups,
      metadata,
    },
    HTTPStatusCodes.OK,
  );
};

export const getGroupById: AppRouteHandler<TGetGroupById> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const logger = c.get("logger");

  if (!user) {
    logger.error("User is not authorized to delete group");
    return c.json(
      {
        success: false,
        message: AUTHORIZATION_ERROR_MESSAGE,
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  const groupById = await getGroupByIdRepository(id);

  if (!groupById) {
    logger.error(`Group with ${id} not found`);
    return c.json(
      {
        success: false,
        message: `Group with ${id} not found`,
      },
      HTTPStatusCodes.NOT_FOUND,
    );
  }

  if (groupById.creatorId !== user.id && user.role === AuthRoles.USER) {
    logger.error(`Group with ${id} cannot be accessed by the logged in user`);
    return c.json(
      {
        success: false,
        message: `Group with ${id} cannot be accessed by the logged in user`,
      },
      HTTPStatusCodes.FORBIDDEN,
    );
  }

  logger.debug(`Group with ${id} retrieved successfully`);
  return c.json(
    {
      success: true,
      message: `Group with ${id} retrieved successfully`,
      data: groupById,
    },
    HTTPStatusCodes.OK,
  );
};

export const updateGroup: AppRouteHandler<IUpdateGroupRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");
  const logger = c.get("logger");

  if (!user) {
    logger.error("User is not logged in");
    return c.json(
      {
        success: false,
        message: AUTHORIZATION_ERROR_MESSAGE,
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  const updatedGroup = await updateGroupRepository(
    { ...payload, creatorId: user.id },
    id,
  );
  const groupById = await getGroupByIdRepository(id);

  if (!updatedGroup) {
    logger.error(`Group with ${id} not found`);
    return c.json(
      {
        success: false,
        message: `Group with ${id} not found`,
      },
      HTTPStatusCodes.NOT_FOUND,
    );
  }

  if (groupById.creatorId !== user.id && user.role === AuthRoles.USER) {
    logger.error(`Group with ${id} cannot be accessed by the logged in user`);
    return c.json(
      {
        success: false,
        message: `Group with ${id} cannot be accessed by the logged in user`,
      },
      HTTPStatusCodes.FORBIDDEN,
    );
  }

  void logActivity({
    type: ActivityType.GROUP_UPDATED,
    metadata: {
      action: "update",
      resourceType: "group",
      resourceName: updatedGroup.name,
      actorId: user.id,
      actorName: user.fullName || "",
    },
  });
  logger.debug(`Group updated successfully with name ${updatedGroup.name}`);

  return c.json(
    {
      success: true,
      message: "Group updated successfully",
      data: updatedGroup,
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
        message: AUTHORIZATION_ERROR_MESSAGE,
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

  let userIds: string[] = [];
  let usernames: string[] = [];

  payload.forEach((userDetail) => {
    userIds = [userDetail.userId, ...userIds];
    usernames = [userDetail.username, ...usernames];
  });
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

  payload.forEach((userData) => {
    void logActivity({
      type: ActivityType.GROUP_MEMBER_ADDED,
      metadata: {
        action: "update",
        resourceType: "group",
        resourceName: groupExists.name,
        actorId: user.id,
        actorName: user.fullName || "",
        targetId: userData.userId,
        targetName: userData.username,
        destinationId: groupExists.id,
      },
    });
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
