import { AuthRoles } from "@/common/enums";
import { generateMetadata } from "@/common/helpers/metadata.helper";
import type { AppRouteHandler } from "@/common/lib/types";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import { getActivitiesRepository } from "./activity.repository";
import type { TGetActivitiesRoute } from "./activity.routes";
import { organizeActivities } from "./activity.utils";

export const getActivities: AppRouteHandler<TGetActivitiesRoute> = async (
  c,
) => {
  const logger = c.get("logger");
  const user = c.get("user");
  const queryParams = c.req.valid("query");

  if (!user) {
    logger.debug("User is not authorized to get activities");
    return c.json(
      {
        success: false,
        message: "You are not authorized, please login",
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  const { activities, totalCount } = await getActivitiesRepository(
    user.role === AuthRoles.ADMIN ? queryParams.userId || user.id : user.id,
    queryParams,
  );

  const organizedActivities = organizeActivities(
    activities,
    queryParams.userId,
  );

  const metadata = generateMetadata({
    ...queryParams,
    totalCount,
  });
  logger.info("Activities retrieved successfully");

  return c.json(
    {
      success: true,
      message: "Activities retrieved successfully",
      data: organizedActivities,
      metadata,
    },
    HTTPStatusCodes.OK,
  );
};
