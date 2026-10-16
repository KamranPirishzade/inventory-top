import { Router } from "express";
import categoriesController from "../controllers/categoriesContoller.ts";

const categoriesRouter = Router();

categoriesRouter.get("/", categoriesController.getCategories);
// categoriesRouter.get("/add");
// categoriesRouter.post("/add");
categoriesRouter.get("/:id", categoriesController.getCategoryById);
// categoriesRouter.get("/:id/update");
// categoriesRouter.post("/:id/update");
// categoriesRouter.post("/:id/delete");

export default categoriesRouter;
