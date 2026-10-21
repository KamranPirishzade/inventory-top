import { Router } from "express";
import categoriesController from "../controllers/categoriesContoller.ts";

const categoriesRouter = Router();

categoriesRouter.get("/", categoriesController.getCategories);
categoriesRouter.get("/add", categoriesController.addCategoryGet);
categoriesRouter.post(
  "/add",
  categoriesController.validateCategory,
  categoriesController.addCategory,
);
// categoriesRouter.get("/:id", categoriesController.getCategoryById);
categoriesRouter.get("/:id/update", categoriesController.updateCategoryGet);
categoriesRouter.post(
  "/:id/update",
  categoriesController.validateCategoryForUpdate,
  categoriesController.updateCategoryPost,
);
categoriesRouter.get("/:id/delete", categoriesController.deleteCategoryGet);
categoriesRouter.post("/:id/delete", categoriesController.deleteCategoryPost);

export default categoriesRouter;
