import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";

import { db } from "@/db/adapter";
import type { TUserSchema } from "@/common/schema/user.schema";
import type { TInsertGroupSchema } from "@/db/schemas/group.model";

import { AuthRoles } from "@/common/enums";
import { db } from "@/db/adapter";
import groupModel from "@/db/schemas/group.model";

import type { TGroupQuerySchema } from "./group.schema";

export async function createGroupRepository(groupPayload: TInsertGroupSchema) {
  const [group] = await db.insert(groupModel).values(groupPayload).returning();

  return group;
}

export async function getAllGroupsRepository(queryParams: TGroupQuerySchema, userDetails: TUserSchema) {
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

export async function deleteGroupRepository(groupId: string) {
  const [deletedGroups] = await db
    .delete(groupModel)
    .where(eq(groupModel.id, groupId))
    .returning();

  return deletedGroups;
}
