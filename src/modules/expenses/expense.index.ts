import { createRouter } from "@/common/lib/create-app.lib";

import * as handlers from "./expense.handlers";
import * as routes from "./expense.routes";

export const expenseRouter = createRouter().openapi(
  routes.createExpenseRoute,
  handlers.createExpense,
);
