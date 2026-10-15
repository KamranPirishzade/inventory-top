import { error } from "node:console";
import { Client } from "pg";

const SQL = `
    CREATE TABLE IF NOT EXISTS categories(
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name VARCHAR(255) NOT NULL UNIQUE CHECK(name<>'')
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
        ('Optimus Prime', 'Leader of the Autobots from Transformers', 29.99, 100, 1, 1, 'https://example.com/optimus_prime.jpg'),
        ('Barbie Dreamhouse', 'Iconic Barbie dollhouse with furniture and accessories', 199.99, 50, 3, 2, 'https://example.com/barbie_dreamhouse.jpg'),
        ('LEGO Millennium Falcon', 'Detailed LEGO set of the Millennium Falcon from Star Wars', 159.99, 75, 1, 3, 'https://example.com/lego_millennium_falcon.jpg'),
        ('Hot Wheels 2021 Ford Mustang', 'Die-cast model of the 2021 Ford Mustang', 19.99, 200, 2, 2, 'https://example.com/hot_wheels_mustang.jpg'),
        ('LEGO Star Wars X-Wing Fighter', 'LEGO set of the X-Wing Fighter from Star Wars', 89.99, 120, 1, 3, 'https://example.com/lego_xwing_fighter.jpg'),
        ('Barbie Fashionista Doll', 'Fashionable Barbie doll with trendy outfits', 24.99, 150, 3, 2, 'https://example.com/barbie_fashionista.jpg')
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
