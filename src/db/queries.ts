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

async function getCategories(): Promise<Omit<Category, "description">[]> {
  const { rows } = await pool.query<Omit<Category, "description">>(
    "SELECT id, name FROM categories ORDER BY name;",
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

async function getBrands(): Promise<Brand[]> {
  const { rows } = await pool.query<Brand>(
    "SELECT * FROM brands ORDER BY name;",
  );
  return rows;
}

export default {
  getItems,
  getItemsByCategory,
  getItemById,
  getCategories,
  getCategoryById,
  getBrands,
};
