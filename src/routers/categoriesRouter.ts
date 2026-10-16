import { Router } from "express";

const categoriesRouter = Router();

categoriesRouter.get("/");
categoriesRouter.get("/add");
categoriesRouter.post("/add");
categoriesRouter.get("/:id");
categoriesRouter.get("/:id/update");
categoriesRouter.post("/:id/update");
categoriesRouter.post("/:id/delete");

export default categoriesRouter;
