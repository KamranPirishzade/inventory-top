import { Router } from "express";

const itemRouter = Router();

itemRouter.get("/");
itemRouter.get("/add");
itemRouter.post("/add");
itemRouter.post("/:itemId/delete");
itemRouter.get("/:itemId/update");
itemRouter.post("/:itemId/update");
itemRouter.get("/:itemId")

export default itemRouter;
