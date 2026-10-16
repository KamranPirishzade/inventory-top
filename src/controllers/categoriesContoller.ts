import type { Request, Response } from "express";
import db from "../db/queries.ts";

async function getCategories(req: Request, res: Response) {
  const categories = await db.getCategories();
  if (!categories) {
    res.status(404).send("No categories found");
    return;
  }
  res.render("categories", { categories });
}

async function getCategoryById(req: Request, res: Response) {
  const { id } = req.params;
  const categoryId = typeof id === "string" ? Number(id) : NaN;
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    res.status(400).send("Invalid category ID");
    return;
  }
  const category = await db.getCategoryById(categoryId);
  if (!category) {
    res.status(404).send("Category not found");
    return;
  }
  res.render("categoryDetail", { category });
}

export default {
  getCategories,
  getCategoryById,
};
