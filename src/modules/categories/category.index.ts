import { createRouter } from "@/common/lib/create-app.lib";

import * as handlers from "./category.handlers";
import * as routes from "./category.routes";

export const categoryRouter = createRouter()
  .openapi(routes.getCategoriesRoute, handlers.getCategories)
  // .openapi(routes.getCategoryRoute, handlers.getCategory)
  .openapi(routes.createCategoryRoute, handlers.createCategory);
  // .openapi(routes.updateCategoryRoute, handlers.updateCategory)
  // .openapi(routes.deleteCategoryRoute, handlers.deleteCategory);
