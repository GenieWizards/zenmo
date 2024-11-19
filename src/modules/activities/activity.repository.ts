import type { TInsertActivitySchema } from "@/db/schemas/activity.model";

import { db } from "@/db/adapter";
import activityModel from "@/db/schemas/activity.model";

export async function createActivityRepository(payload: TInsertActivitySchema) {
  const [activity] = await db.insert(activityModel).values(payload).returning();

  return activity;
}
