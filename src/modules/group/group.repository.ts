import { eq } from "drizzle-orm";

import { db } from "@/db/adapter";
import type { TInsertGroupSchema } from "@/db/schemas/group.model";
import groupModel from "@/db/schemas/group.model";

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
