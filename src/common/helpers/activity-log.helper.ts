import { db } from "@/db/adapter";
import { activityModel } from "@/db/schemas";
import type { IActivityMetadata } from "@/modules/activities/activity.types";

import type { ActivityTypeValues } from "../enums";
import { customLogger } from "../middlewares";

export async function logActivity(params: {
  type: ActivityTypeValues;
  metadata: IActivityMetadata;
  groupId?: string;
}) {
  const { type, metadata, groupId } = params;

  try {
    await db.insert(activityModel).values({
      type,
      metadata,
      groupId,
    });

    customLogger.info({ ...params }, "Activity log created");
  } catch (error) {
    customLogger.error({ error, ...params }, "Failed to create activity log");
  }
}
