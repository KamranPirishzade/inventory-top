import { Client } from "pg";

const SQL = `
    CREATE TABLE IF NOT EXISTS categories(
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name VARCHAR(255) NOT NULL UNIQUE CHECK(name<>''),
        description TEXT
    );
    CREATE TABLE IF NOT EXISTS brands(
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name VARCHAR(255) NOT NULL UNIQUE CHECK(name<>''),
        description TEXT
    );
    CREATE TABLE IF NOT EXISTS figures(
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name VARCHAR(255) NOT NULL CHECK(name<>''),
        description TEXT,
        price NUMERIC(10,2) NOT NULL CHECK(price>=0), 
        stock INTEGER DEFAULT 0 NOT NULL CHECK(stock>=0),
        category_id INTEGER NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
        brand_id INTEGER NOT NULL REFERENCES brands (id) ON DELETE RESTRICT,
        img_url TEXT,
        UNIQUE (name, brand_id)
    );

    CREATE INDEX IF NOT EXISTS figures_category_id_idx ON figures (category_id);
    CREATE INDEX IF NOT EXISTS figures_brand_id_idx ON figures (brand_id);
    CREATE UNIQUE INDEX IF NOT EXISTS categories_name_lower_idx ON categories (LOWER(name));

    INSERT INTO categories(name, description)
    VALUES 
        ('Action Figures', 'Collectible figures of popular characters'),
        ('Model Cars', 'Scale models of various car makes and models'),
        ('Dolls', 'Soft toys in the form of human figures')
    ;

    INSERT INTO brands(name, description)
    VALUES 
        ('Hasbro', 'A leading toy manufacturer known for action figures and dolls'),
        ('Mattel', 'Famous for Barbie dolls and Hot Wheels cars'),
        ('LEGO', 'Renowned for its interlocking plastic bricks and themed sets')
    ;

    INSERT INTO figures(name, description, price, stock, category_id, brand_id, img_url)
    VALUES 
        ('Optimus Prime', 'Leader of the Autobots from Transformers', 29.99, 100, 1, 1, 'https://transformersbattersea.com/cdn/shop/files/OptimusPose-014cropped_JPG.png?v=1780482430&width=2048'),
        ('Barbie Dreamhouse', 'Iconic Barbie dollhouse with furniture and accessories', 199.99, 50, 3, 2, 'https://ak1.ostkcdn.com/images/products/10150858/Barbie-Dreamhouse-CJR47-d8e4731e-dd4a-4e6e-b803-68b5fe8e316f_600.jpg?impolicy=medium'),
        ('LEGO Millennium Falcon', 'Detailed LEGO set of the Millennium Falcon from Star Wars', 159.99, 75, 1, 3, 'https://www.lego.com/cdn/cs/set/assets/blt3349f56c6f192e18/75192_Prod.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1'),
        ('Hot Wheels 2021 Ford Mustang', 'Die-cast model of the 2021 Ford Mustang', 19.99, 200, 2, 2, 'https://www.kroger.com/product/images/xlarge/front/0019473512475'),
        ('LEGO Star Wars X-Wing Fighter', 'LEGO set of the X-Wing Fighter from Star Wars', 89.99, 120, 1, 3, 'https://www.lego.com/cdn/cs/set/assets/blt1a561f9edb28d303/75218.jpg?fit=crop&quality=80&width=800&height=800&dpr=1'),
        ('Barbie Fashionista Doll', 'Fashionable Barbie doll with trendy outfits', 24.99, 150, 3, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp7FOOGMuKtCpdU67sEnTzV9beA6dKtT-QFoYpVDtHdJ2IlbYojgNHjCM&s=10')
    ;
`;

async function main() {
  console.log("Seeding starts");
  if (!process.env.DATABASE_URL) {
    throw Error("DATABASE_URL is not set");
  }
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  try {
    await client.query(SQL);
    console.log("Seeding finished");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Seeding failed: ", err.message);
  process.exit(1);
});
