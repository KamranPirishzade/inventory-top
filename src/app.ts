import express from "express";
import path from "node:path";
import itemsRouter from "./routers/itemsRouter.ts";
import categoriesRouter from "./routers/categoriesRouter.ts";
import type { Request, Response, NextFunction } from "express";

const rootDir = path.join(import.meta.dirname, "..");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));
app.set("views", path.join(rootDir, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect("/items");
});

app.use("/items", itemsRouter);
app.use("/categories", categoriesRouter);

app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err: unknown) => {
  if (err) {
    throw err;
  }
  console.log(`App is running on: http://localhost:${PORT}`);
});
