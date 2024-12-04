import type { AppRouteHandler } from "@/common/lib/types";

import { ActivityType, AuthRoles } from "@/common/enums";
import { logActivity } from "@/common/helpers/activity-log.helper";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import type { TCreateExpenseRoute } from "./expense.routes";

import { getCategoryRepository } from "../categories/category.repository";
import { getUserByIdRepository } from "../users/user.repository";
import { createExpenseRepository } from "./expense.repository";

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

  const { payerId } = payload;

  // check if payerId is valid
  if (payerId) {
    const payerUser = await getUserByIdRepository(payerId);

    if (!payerUser) {
      logger.debug("Payer not found");
      return c.json(
        {
          success: false,
          message: "Payer not found",
        },
        HTTPStatusCodes.NOT_FOUND,
      );
    }
  }

  const { categoryId } = payload;
  if (categoryId) {
    const category = await getCategoryRepository(categoryId);

    const validCategoryUserId = user.role === AuthRoles.ADMIN ? payerId : user.id;
    if (category.userId && category.userId !== validCategoryUserId) {
      logger.debug("Category does not belong to user");
      return c.json(
        {
          success: false,
          message: "Category does not belong to valid category user",
        },
        HTTPStatusCodes.BAD_REQUEST,
      );
    }
  }

  let expense;
  switch (user.role) {
    case AuthRoles.USER: {
      const expensePayload = {
        ...payload,
        payerId: payerId || user.id,
        creatorId: user.id,
      };

      expense = await createExpenseRepository(expensePayload);
      break;
    }
    case AuthRoles.ADMIN: {
      // check if payerId exists
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

      const expensePayload = {
        ...payload,
        payerId,
        creatorId: user.id,
      };
      expense = await createExpenseRepository(expensePayload);
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
      HTTPStatusCodes.INTERNAL_SERVER_ERROR,
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
