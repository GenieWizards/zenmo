import { eq } from "drizzle-orm";

import type { TInsertGroupSchema } from "@/db/schemas/group.model";

import { db } from "@/db/adapter";
import groupModel from "@/db/schemas/group.model";

export async function createGroupRepository(
  groupPayload: TInsertGroupSchema,
) {
  const [group] = await db
    .insert(groupModel)
    .values(groupPayload)
    .returning();

  return group;
}

export async function deleteGroupRepository(
  groupId: string,
) {
  const [deletedGroups] = await db
    .delete(groupModel)
    .where(eq(groupModel.id, groupId))
    .returning();

  return deletedGroups?.id || null;
}
