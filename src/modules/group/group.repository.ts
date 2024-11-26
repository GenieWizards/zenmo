import type { SQL } from "drizzle-orm";

import { and, eq, sql } from "drizzle-orm";

import type { TInsertGroupSchema } from "@/db/schemas/group.model";

import { db } from "@/db/adapter";
import groupModel from "@/db/schemas/group.model";

import type { TGroupQuerySchema } from "./group.schema";

export async function createGroupRepository(groupPayload: TInsertGroupSchema) {
  const [group] = await db.insert(groupModel).values(groupPayload).returning();

  return group;
}

export async function getAllGroupsRepository(queryParams: TGroupQuerySchema) {
  const { page, limit, status } = queryParams;
  const offset = (page - 1) * limit;
  const whereConditions: SQL<unknown>[] = [];

  if (status !== undefined) {
    whereConditions.push(eq(groupModel.status, status));
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
    .offset(offset);

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
