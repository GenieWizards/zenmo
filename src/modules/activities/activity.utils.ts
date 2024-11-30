import { activityModel } from "@/db/schemas";
import type { TSelectActivitySchema } from "@/db/schemas/activity.model";

import type { IActivityMetadata } from "./activity.types";

export function activitySortBy(sortBy: string | undefined) {
  if (sortBy === "updatedAt") {
    return activityModel.updatedAt;
  } else {
    return activityModel.createdAt;
  }
}

export function organizeActivities(
  activities: (Omit<TSelectActivitySchema, "metadata"> & {
    metadata: unknown;
  })[],
  userId: string | undefined,
) {
  return activities.map((activity) => {
    return formatCategoryActivity(
      activity.id,
      activity.metadata as IActivityMetadata,
      userId,
    );
  });
}

function formatCategoryActivity(
  id: string,
  activity: IActivityMetadata,
  userId: string | undefined,
) {
  switch (activity.action) {
    case "create":
      return {
        id,
        message: `${userId ? activity.actorName : "You"} created a new category "${activity.resourceName}"`,
      };
    case "update":
      return {
        id,
        message: `${userId ? activity.actorName : "You"} updated the category "${activity.resourceName}"`,
      };
    case "delete":
      return {
        id,
        message: `${userId ? activity.actorName : "You"} deleted the category "${activity.resourceName}"`,
      };
    default:
      return { id: "", message: "Unknown category activity" };
  }
}
