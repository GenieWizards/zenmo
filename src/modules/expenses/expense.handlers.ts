import type { AppRouteHandler } from "@/common/lib/types";

import { ActivityType, AuthRoles } from "@/common/enums";
import { logActivity } from "@/common/helpers/activity-log.helper";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import type { TCreateExpenseRoute } from "./expense.routes";

import { getCategoryRepository } from "../categories/category.repository";
import {
  createExpenseRepositoryViaAdmin,
  createExpenseRepositoryViaUser,
} from "./expense.repository";

export const createExpense: AppRouteHandler<TCreateExpenseRoute> = async (
  c,
) => {
  const logger = c.get("logger");
  const user = c.get("user");
  const payload = c.req.valid("json");

  if (!user) {
    logger.debug("User is not authorized to create expense");
    return c.json(
      {
        success: false,
        message: "You are not authorized, please login",
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  let expense;
  switch (user.role) {
    case AuthRoles.USER: {
      const { categoryId } = payload;

      // check if category either belongs to user or global
      if (categoryId) {
        const category = await getCategoryRepository(categoryId);

        if (!category.userId && category.userId !== user.id) {
          logger.debug("Category does not belongs to user");
          return c.json(
            {
              success: false,
              message: "Category does not belongs to user",
            },
            HTTPStatusCodes.BAD_REQUEST,
          );
        }
      }

      expense = await createExpenseRepositoryViaUser(payload, user?.id);
      break;
    }
    case AuthRoles.ADMIN: {
      const { payerId, categoryId } = payload;
      if (!payerId) {
        logger.debug("Missing payer Id to create expense");
        return c.json(
          {
            success: false,
            message: "Missing payerId",
          },
          HTTPStatusCodes.BAD_REQUEST,
        );
      }

      // check if category either belongs to user or global
      if (categoryId) {
        const category = await getCategoryRepository(categoryId);

        if (!category.userId && category.userId !== payerId) {
          logger.debug("Category does not belongs to payer");
          return c.json(
            {
              success: false,
              message: "Category does not belongs to payer",
            },
            HTTPStatusCodes.BAD_REQUEST,
          );
        }
      }

      const adminPayload = {
        ...payload,
        payerId,
      };
      expense = await createExpenseRepositoryViaAdmin(adminPayload, user.id);
      break;
    }
  }

  if (!expense) {
    logger.error("Failed to create expense");
    return c.json(
      {
        success: false,
        message: "Failed to create expense",
      },
      HTTPStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  void logActivity({
    type: ActivityType.EXPENSE_ADDED,
    metadata: {
      action: "create",
      resourceType: "expense",
      actorId: user.id,
      targetId: expense.id,
      actorName: user.fullName || "",
      msg: "expense created",
    },
  });
  logger.debug(`Expense created successfully`);
  return c.json(
    {
      success: true,
      message: "Expense created successfully",
      data: expense,
    },
    HTTPStatusCodes.CREATED,
  );
};
