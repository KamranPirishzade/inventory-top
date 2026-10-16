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
