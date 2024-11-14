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
