import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";

import { AuthRoles } from "@/common/enums";
import { db } from "@/db/adapter";
import type { TInsertGroupSchema } from "@/db/schemas/group.model";
import groupModel from "@/db/schemas/group.model";
import { usersToGroupsModel } from "@/db/schemas/user-to-group.model";
import type { TSelectUserSchema } from "@/db/schemas/user.model";

import type { TGroupQuerySchema } from "./group.schema";

export async function createGroupRepository(groupPayload: TInsertGroupSchema) {
  const [group] = await db.insert(groupModel).values(groupPayload).returning();

  return group;
}

export async function getAllGroupsRepository(queryParams: TGroupQuerySchema, userDetails: TSelectUserSchema) {
  const { page, limit, status, sortOrder, search } = queryParams;
  const offset = (page - 1) * limit;
  const whereConditions: SQL<unknown>[] = [];

  if (userDetails.role === AuthRoles.USER) {
    whereConditions.push(eq(groupModel.creatorId, userDetails.id));
  }

  if (status !== undefined) {
    whereConditions.push(eq(groupModel.status, status));
  }

  if (search) {
    whereConditions.push(ilike(groupModel.name, `%${search.toLowerCase()}%`));
  }

  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(groupModel)
    .where(and(...whereConditions));

  const groups = await db
    .select()
    .from(groupModel)
    .where(and(...whereConditions))
    .limit(limit)
    .offset(offset)
    .orderBy(sortOrder === "asc" ? asc(groupModel.createdAt) : desc(groupModel.createdAt));

  return {
    totalCount: totalCount[0].count,
    groups,
  };
}

export async function getGroupByIdRepository(groupId: string) {
  const [groupById] = await db
    .select()
    .from(groupModel)
    .where(eq(groupModel.id, groupId))
    .limit(1);

  return groupById;
}

export async function updateGroupRepository(updatePayload: Partial<TInsertGroupSchema>, groupId: string) {
  const [updatedGroup] = await db
    .update(groupModel)
    .set({ name: updatePayload.name, updatedAt: new Date() })
    .where(eq(groupModel.id, groupId))
    .returning();

  return updatedGroup;
}

export async function deleteGroupRepository(groupId: string) {
  const [deletedGroups] = await db
    .delete(groupModel)
    .where(eq(groupModel.id, groupId))
    .returning();

  return deletedGroups;
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
