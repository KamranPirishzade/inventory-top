import type { Request, Response } from "express";
import db from "../db/queries.ts";
import { isUniqueViolationError, parseId } from "../utils.ts";
import { body, validationResult, matchedData } from "express-validator";

const itemValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Item name is required")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Item name must be at most 100 characters long"),
  body("description")
    .trim()
    .optional({ values: "falsy" })
    .isLength({ max: 500 })
    .withMessage("Item description must be at most 500 characters long"),
  body("price")
    .trim()
    .notEmpty()
    .withMessage("Item price is required")
    .bail()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage(
      "Item price must be a valid decimal number with up to two decimal places",
    )
    .isFloat({ min: 0, max: 99999999.99 })
    .withMessage("Item price must be between 0 and 99999999.99"),
  body("stock")
    .trim()
    .notEmpty()
    .withMessage("Item stock is required")
    .bail()
    .isInt({ min: 0, max: 100000000 })
    .withMessage(
      "Item stock must be a non-negative integer between 0 and 100000000",
    ),
  body("category_id")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Please choose a valid category")
    .bail()
    .toInt()
    .custom(async (id) => {
      if (!(await db.getCategoryById(id)))
        throw new Error("Please choose a valid category");
    }),
  body("brand_id")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Please choose a valid brand")
    .bail()
    .toInt()
    .custom(async (id) => {
      if (!(await db.getBrandById(id)))
        throw new Error("Please choose a valid brand");
    }),
  body("img_url")
    .optional({ values: "falsy" })
    .isURL()
    .withMessage("Please provide a valid image URL"),
];

async function getItems(req: Request, res: Response) {
  const raw = req.query.category_id;
  const categoryId = parseId(raw);
  const hasFilter = categoryId !== undefined;
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
  const itemId = parseId(id);
  if (itemId === undefined) {
    res.status(404).send("Invalid item ID");
    return;
  }

  const item = await db.getItemById(itemId);
  if (!item) {
    res.status(404).send("Item not found");
    return;
  }

  res.render("itemDetail", { item });
}

async function addItemsGet(req: Request, res: Response) {
  const [categories, brands] = await Promise.all([
    db.getCategories(),
    db.getBrands(),
  ]);
  res.render("addItem", { errors: null, values: null, categories, brands });
}

async function addItemPost(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [categories, brands] = await Promise.all([
      db.getCategories(),
      db.getBrands(),
    ]);
    res.status(400).render("addItem", {
      errors: errors.array(),
      values: req.body,
      categories,
      brands,
    });
    return;
  }

  const { name, description, price, stock, category_id, brand_id, img_url } =
    matchedData(req);
  try {
    await db.addItem(
      name,
      description,
      price,
      stock,
      category_id,
      brand_id,
      img_url || null,
    );
  } catch (err) {
    if (
      isUniqueViolationError(err) &&
      err.constraint === "figures_name_lower_brand_id_idx"
    ) {
      const [categories, brands] = await Promise.all([
        db.getCategories(),
        db.getBrands(),
      ]);
      res.status(409).render("addItem", {
        errors: [
          {
            msg: `An "${name} by ${brands.find((b) => b.id === brand_id)?.name}" already exists`,
          },
        ],
        values: req.body,
        categories,
        brands,
      });
      return;
    }
    throw err;
  }

  res.redirect("/items");
}

async function updateItemGet(req: Request, res: Response) {
  const { id } = req.params;

  const itemId = parseId(id);
  if (itemId === undefined) {
    res.status(404).send("Invalid item ID");
    return;
  }

  const item = await db.getItemById(itemId);
  if (!item) {
    res.status(404).send("Item not found");
    return;
  }

  const [categories, brands] = await Promise.all([
    db.getCategories(),
    db.getBrands(),
  ]);

  res.render("updateItem", {
    errors: null,
    values: item,
    categories,
    brands,
    itemId,
  });
  return;
}

async function updateItemPost(req: Request, res: Response) {
  const { id } = req.params;
  const itemId = parseId(id);
  if (itemId === undefined) {
    res.status(404).send("Invalid item ID");
    return;
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [categories, brands] = await Promise.all([
      db.getCategories(),
      db.getBrands(),
    ]);
    res.status(400).render("updateItem", {
      errors: errors.array(),
      itemId,
      values: req.body,
      categories,
      brands,
    });
    return;
  }

  const { name, description, price, stock, category_id, brand_id, img_url } =
    matchedData(req);

  try {
    const isUpdated = await db.updateItem(
      itemId,
      name,
      description,
      price,
      stock,
      category_id,
      brand_id,
      img_url || null,
    );
    if (!isUpdated) {
      res.status(404).send("Item not found");
      return;
    }
  } catch (err) {
    if (
      isUniqueViolationError(err) &&
      err.constraint === "figures_name_lower_brand_id_idx"
    ) {
      const [categories, brands] = await Promise.all([
        db.getCategories(),
        db.getBrands(),
      ]);
      res.status(409).render("updateItem", {
        errors: [
          {
            msg: `"${name} by ${brands.find((b) => b.id === brand_id)?.name}" already exists`,
          },
        ],
        itemId,
        values: req.body,
        categories,
        brands,
      });
      return;
    }
    throw err;
  }
  res.redirect("/items");
}

export default {
  getItems,
  getItemById,
  addItemsGet,
  itemValidationRules,
  addItemPost,
  updateItemGet,
  updateItemPost,
};
