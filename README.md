# FigureStore Inventory

An inventory management app for an imaginary collectible figure store, built for [The Odin Project](https://www.theodinproject.com/lessons/node-path-nodejs-inventory-application).

**Live demo:** _add your Render link here_

## Features

- Browse all items, or filter them by category
- Create, view, edit and delete items and categories
- Each item belongs to one category and one brand
- Server-side validation with clear error messages; the form keeps what you typed
- Item names are unique per brand, and category names are unique (both case-insensitive)
- A category that still has items cannot be deleted, so no item is ever left without a category
- Editing and deleting require an admin password

## Tech stack

- **Node.js 24** and **Express 5**, written in **TypeScript** (run directly by Node in development)
- **PostgreSQL** with the `pg` driver and plain SQL queries
- **EJS** templates
- **express-validator** for form validation
- **Tailwind CSS** for styling

## Database

```
categories            figures                         brands
----------            -------                         ------
id          ◄──────── category_id                ┌──► id
name                  brand_id ──────────────────┘    name
description           name, description               description
                      price, stock, img_url
```

- `price` is `NUMERIC(10, 2)` and `stock` is an `INTEGER`; both have `CHECK (>= 0)` constraints
- Both foreign keys use `ON DELETE RESTRICT`
- Unique indexes on `LOWER(categories.name)` and `(LOWER(figures.name), brand_id)`

## Running locally

Requirements: Node.js 24 (see `.nvmrc`) and a PostgreSQL database.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/inventory_top
   ADMIN_PASSWORD=choose-a-password
   ```

   `PORT` is optional (defaults to 3000).

3. Create the tables and add sample data (run this once, on an empty database):

   ```bash
   npm run seed
   ```

4. Build the CSS, then start the server:

   ```bash
   npm run build:css
   npm run dev
   ```

   Open http://localhost:3000. While working on styles, run `npm run watch:css` in a second terminal.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the server and restart on file changes |
| `npm run seed` | Create the tables and insert sample data |
| `npm run typecheck` | Check types with TypeScript |
| `npm run build` | Compile TypeScript to `dist/` and build the CSS |
| `npm start` | Run the compiled app from `dist/` |

## Deployment

The app runs as a web service on Render, with the database on Neon.

- Build command: `npm install --include=dev && npm run build`
- Start command: `npm start`
- Environment variables: `DATABASE_URL`, `ADMIN_PASSWORD`, `NODE_ENV=production`

If `ADMIN_PASSWORD` is not set, editing and deleting are refused.
