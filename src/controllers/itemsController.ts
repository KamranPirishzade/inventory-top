import type { Request, Response } from "express";
import db from "../db/queries.ts";

async function getItems(req: Request, res: Response) {
  const raw = req.query.category_id;
  const categoryId = typeof raw === "string" ? Number(raw) : NaN;
  const hasFilter = Number.isInteger(categoryId) && categoryId > 0;
  const [items, categories] = await Promise.all([
    hasFilter ? db.getItemsByCategory(categoryId) : db.getItems(),
    db.getCategories(),
  ]);

  res.render("index", {
    items,
    categories,
    selectedCategory: hasFilter ? categoryId : null,
  });
}

async function getItemById(req: Request, res: Response) {
  const { id } = req.params;
  const itemIdPolished = typeof id === "string" ? Number(id) : NaN;
  if (!Number.isInteger(itemIdPolished) || itemIdPolished <= 0) {
    res.status(400).send("Invalid item ID");
    return;
  }

  const item = await db.getItemById(itemIdPolished);
  if (!item) {
    res.status(404).send("Item not found");
    return;
  }

  res.render("itemDetail", { item });
}

export default {
  getItems,
  getItemById,
};
