import { eq } from "drizzle-orm";

import { db } from "@/db/adapter";
import type { TInsertGroupSchema } from "@/db/schemas/group.model";
import groupModel from "@/db/schemas/group.model";
import { usersToGroupsModel } from "@/db/schemas/user-to-group.model";

export async function createGroupRepository(groupPayload: TInsertGroupSchema) {
  const [group] = await db.insert(groupModel).values(groupPayload).returning();

  return group;
}

export async function deleteGroupRepository(groupId: string) {
  const [deletedGroups] = await db
    .delete(groupModel)
    .where(eq(groupModel.id, groupId))
    .returning();

  return deletedGroups;
}

export async function getGroupByIdRepository(groupId: string) {
  const [group] = await db
    .select()
    .from(groupModel)
    .where(eq(groupModel.id, groupId))
    .limit(1);

  return group;
}

export async function addUsersToGroupRepository(
  groupId: string,
  userIds: string[],
) {
  const usersToAdd = userIds.map(userId => ({
    userId,
    groupId,
  }));

  const [addedUsers] = await db
    .insert(usersToGroupsModel)
    .values(usersToAdd)
    .onConflictDoNothing()
    .returning();

  return addedUsers;
}
