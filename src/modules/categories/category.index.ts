import { createRouter } from "@/common/lib/create-app.lib";

import * as handlers from "./category.handlers";
import * as routes from "./category.routes";

export const categoryRouter = createRouter()
  .openapi(routes.getCategoriesRoute, handlers.getCategories)
  .openapi(routes.createCategoryRoute, handlers.createCategory)
  .openapi(routes.getCategoryRoute, handlers.getCategory);
// .openapi(routes.updateCategoryRoute, handlers.updateCategory)
// .openapi(routes.deleteCategoryRoute, handlers.deleteCategory);
