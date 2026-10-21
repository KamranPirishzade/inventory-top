import pool from "./pool.ts";

interface Figure {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category_id: number;
  brand_id: number;
  img_url: string | null;
}

interface FigureWithBrand extends Figure {
  brand_name: string;
  category_name: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Brand {
  id: number;
  name: string;
  description: string;
}

async function getItems(): Promise<FigureWithBrand[]> {
  const { rows } = await pool.query<FigureWithBrand>(
    "SELECT f.*, b.name AS brand_name FROM figures f JOIN brands b on f.brand_id=b.id ORDER BY f.name;",
  );
  return rows;
}

async function getItemsByCategory(
  categoryId: number,
): Promise<FigureWithBrand[]> {
  const { rows } = await pool.query<FigureWithBrand>(
    "SELECT f.*, b.name AS brand_name, c.name AS category_name FROM figures f JOIN brands b on f.brand_id=b.id JOIN categories c on f.category_id=c.id WHERE category_id = $1 ORDER BY f.name;",
    [categoryId],
  );
  return rows;
}

async function getItemById(
  itemId: number,
): Promise<FigureWithBrand | undefined> {
  const { rows } = await pool.query<FigureWithBrand>(
    "SELECT f.*, b.name AS brand_name, c.name AS category_name FROM figures f JOIN brands b on f.brand_id=b.id JOIN categories c on f.category_id=c.id WHERE f.id = $1;",
    [itemId],
  );
  return rows[0];
}

async function getCategories(): Promise<Category[]> {
  const { rows } = await pool.query<Category>(
    "SELECT * FROM categories ORDER BY name;",
  );
  return rows;
}
async function getCategoryById(
  categoryId: number,
): Promise<Category | undefined> {
  const { rows } = await pool.query<Category>(
    "SELECT * FROM categories WHERE id=$1;",
    [categoryId],
  );
  return rows[0];
}

async function getCategoryItemCount(categoryId: number): Promise<string> {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*) AS count FROM figures WHERE category_id=$1;",
    [categoryId],
  );
  return rows[0].count;
}

async function getBrands(): Promise<Brand[]> {
  const { rows } = await pool.query<Brand>(
    "SELECT * FROM brands ORDER BY name;",
  );
  return rows;
}

async function getBrandById(brandId: number): Promise<Brand | undefined> {
  const { rows } = await pool.query<Brand>(
    "SELECT * FROM brands WHERE id=$1;",
    [brandId],
  );
  return rows[0];
}

async function addItem(
  name: string,
  description: string | null,
  price: string,
  stock: number,
  categoryId: number,
  brandId: number,
  img_url: string | null,
): Promise<void> {
  await pool.query(
    "INSERT INTO figures (name, description, price, stock, category_id, brand_id, img_url) VALUES ($1, $2, $3, $4, $5, $6, $7);",
    [name, description, price, stock, categoryId, brandId, img_url],
  );
}

async function addCategory(name: string, description: string): Promise<void> {
  await pool.query(
    "INSERT INTO categories (name, description) VALUES ($1, $2);",
    [name, description],
  );
}

async function updateCategory(
  categoryId: number,
  name: string,
  description: string,
): Promise<boolean> {
  const { rowCount } = await pool.query(
    "UPDATE categories SET name=$1, description=$2 WHERE id=$3;",
    [name, description, categoryId],
  );

  return rowCount === 1;
}

async function deleteCategory(categoryId: number): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM categories WHERE id=$1;", [
    categoryId,
  ]);
  return rowCount === 1;
}

export default {
  getItems,
  getItemsByCategory,
  getItemById,
  getCategories,
  getCategoryById,
  getCategoryItemCount,
  getBrands,
  getBrandById,
  addItem,
  addCategory,
  updateCategory,
  deleteCategory,
};
