import type { Request, Response } from "express";
import db from "../db/queries.ts";
import {
  isCategoryHasItemsError,
  isUniqueViolationError,
  parseId,
} from "../utils.ts";
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

const errorMessages: Record<string, string> = {
  "has-items":
    "Cannot delete this category because it still has items. Move or delete them first.",
};

async function getCategories(req: Request, res: Response) {
  const categories = await db.getCategories();
  const errorCode =
    typeof req.query.error === "string" ? req.query.error : undefined;
  const errorCategoryId = parseId(req.query.categoryId);
  const errorMessage =
    errorCode && Object.hasOwn(errorMessages, errorCode)
      ? errorMessages[errorCode]
      : undefined;

  res.render("categories", {
    categories,
    errorMessage,
    errorCategoryId,
  });
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

async function updateCategoryGet(req: Request, res: Response) {
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

  res.render("updateCategory", { values: category, errors: null, categoryId });
}

async function updateCategoryPost(req: Request, res: Response) {
  const { id } = req.params;
  const categoryId = parseId(id);
  if (categoryId === undefined) {
    res.status(404).send("Invalid category ID");
    return;
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("updateCategory", {
      errors: errors.array(),
      values: req.body,
      categoryId,
    });
    return;
  }
  const { name, description } = matchedData(req);
  try {
    const updated = await db.updateCategory(categoryId, name, description);
    if (!updated) {
      res.status(404).send("Category not found");
      return;
    }
  } catch (err) {
    if (isUniqueViolationError(err)) {
      res.status(409).render("updateCategory", {
        errors: [{ msg: `A category named "${name}" already exists` }],
        values: req.body,
        categoryId,
      });
      return;
    }
    throw err;
  }
  res.redirect("/categories");
}

async function deleteCategoryPost(req: Request, res: Response) {
  const { id } = req.params;
  const categoryId = parseId(id);
  if (categoryId === undefined) {
    res.status(404).send("Invalid category ID");
    return;
  }
  try {
    const deleted = await db.deleteCategory(categoryId);
    if (!deleted) {
      res.status(404).send("Category not found");
      return;
    }
  } catch (err) {
    if (isCategoryHasItemsError(err)) {
      res.redirect("/categories?error=has-items&categoryId=" + categoryId);
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
  updateCategoryGet,
  updateCategoryPost,
  deleteCategoryPost,
};
