import type { SQL } from "drizzle-orm";
import { and, asc, desc, sql } from "drizzle-orm";

import { db } from "@/db/adapter";
import type { TInsertActivitySchema } from "@/db/schemas/activity.model";
import activityModel from "@/db/schemas/activity.model";

import type { TActivityQuery } from "./activity.schema";
import { activitySortBy } from "./activity.utils";

export async function createActivityRepository(payload: TInsertActivitySchema) {
  const [activity] = await db.insert(activityModel).values(payload).returning();

  return activity;
}

export async function getActivitiesRepository(
  userId: string,
  queryParams: TActivityQuery,
) {
  const { page, limit, sortBy, sortOrder, resourceType, action } = queryParams;
  const offset = (page - 1) * limit;

  const sortField = activitySortBy(sortBy);

  const whereConditions: SQL[] = [];

  if (userId) {
    whereConditions.push(
      sql`${activityModel.metadata}->>'actorId' = ${userId}`,
    );
  }

  if (resourceType) {
    whereConditions.push(
      sql`${activityModel.metadata}->>'resourceType' = ${resourceType}`,
    );
  }

  if (action) {
    whereConditions.push(sql`${activityModel.metadata}->>'action' = ${action}`);
  }

  const [activities, totalCount] = await Promise.all([
    db
      .select()
      .from(activityModel)
      .where(whereConditions?.length ? and(...whereConditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(sortOrder === "desc" ? desc(sortField) : asc(sortField)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(activityModel)
      .where(whereConditions?.length ? and(...whereConditions) : undefined),
  ]);

  return { activities, totalCount: totalCount[0].count };
}
