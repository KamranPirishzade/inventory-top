import type { Request, Response } from "express";
import db from "../db/queries.ts";
import { isUniqueViolationError, parseId } from "../utils.ts";
import { body, validationResult, matchedData } from "express-validator";

const validateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Category name must be at most 100 characters long"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Category description is required")
    .bail()
    .isLength({ max: 500 })
    .withMessage("Category description must be at most 500 characters long"),
];

async function getCategories(req: Request, res: Response) {
  const categories = await db.getCategories();

  res.render("categories", { categories });
}

async function getCategoryById(req: Request, res: Response) {
  const { id } = req.params;
  const categoryId = parseId(id);
  if (categoryId === undefined) {
    res.status(404).send("Invalid category ID");
    return;
  }
  const category = await db.getCategoryById(categoryId);
  if (!category) {
    res.status(404).send("Category not found");
    return;
  }
  res.render("categoryDetail", { category });
}

async function addCategoryGet(req: Request, res: Response) {
  res.render("addCategory", { errors: null });
}

async function addCategory(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(400)
      .render("addCategory", { errors: errors.array(), values: req.body });
    return;
  }
  const { name, description } = matchedData(req);

  try {
    await db.addCategory(name, description);
  } catch (err) {
    if (isUniqueViolationError(err)) {
      res.status(409).render("addCategory", {
        errors: [{ msg: `A category named "${name}" already exists` }],
        values: req.body,
      });
      return;
    }
    throw err;
  }

  res.redirect("/categories");
}

export default {
  getCategories,
  getCategoryById,
  addCategory,
  addCategoryGet,
  validateCategory,
};
