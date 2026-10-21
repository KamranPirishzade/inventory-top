import { Router } from "express";
import itemsController from "../controllers/itemsController.ts";

const itemRouter = Router();

itemRouter.get("/", itemsController.getItems);
itemRouter.get("/add", itemsController.addItemsGet);
itemRouter.post(
  "/add",
  itemsController.itemValidationRules,
  itemsController.addItemPost,
);
itemRouter.post("/:id/delete", itemsController.deleteItemPost);
itemRouter.get("/:id/update", itemsController.updateItemGet);
itemRouter.post(
  "/:id/update",
  itemsController.itemValidationRules,
  itemsController.updateItemPost,
);
itemRouter.get("/:id", itemsController.getItemById);

export default itemRouter;
