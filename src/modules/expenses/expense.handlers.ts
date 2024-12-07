import { ActivityType, AuthRoles } from "@/common/enums";
import { logActivity } from "@/common/helpers/activity-log.helper";
import type { AppRouteHandler } from "@/common/lib/types";
import { AUTHORIZATION_ERROR_MESSAGE } from "@/common/utils/constants";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import { getUserByIdRepository } from "../users/user.repository";
import { createExpenseRepository } from "./expense.repository";
import type { TCreateExpenseRoute } from "./expense.routes";
import { isCategoryValidToCreateExpense } from "./expense.util";

export const createExpense: AppRouteHandler<TCreateExpenseRoute> = async (
  c,
) => {
  const logger = c.get("logger");
  const user = c.get("user");
  const payload = c.req.valid("json");

  if (!user) {
    logger.debug("createExpense: User is not authorized to create expense");
    return c.json(
      {
        success: false,
        message: AUTHORIZATION_ERROR_MESSAGE,
      },
      HTTPStatusCodes.UNAUTHORIZED,
    );
  }

  const { payerId, categoryId } = payload;

  // check if payerId is valid
  if (payerId) {
    const payerUser = await getUserByIdRepository(payerId);

    if (!payerUser) {
      logger.debug("createExpense: Payer not found");
      return c.json(
        {
          success: false,
          message: "Payer not found",
        },
        HTTPStatusCodes.NOT_FOUND,
      );
    }
  }

  if (categoryId) {
    const { category, isValid } = await isCategoryValidToCreateExpense(categoryId, payerId, user);

    if (!category) {
      logger.debug("createExpense: Category not found");
      return c.json(
        {
          success: false,
          message: "Category not found",
        },
        HTTPStatusCodes.NOT_FOUND,
      );
    }

    if (!isValid) {
      logger.debug("createExpense: Category does not belong to the user or the specified payer");
      return c.json(
        {
          success: false,
          message: "Category does not belong to the user or the specified payer",
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
        logger.debug("createExpense: Missing payer Id to create expense");
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
      destinationId: expense.id,
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
