import express from "express";
import path from "node:path";

const rootDir = path.join(import.meta.dirname, "..");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));
app.set("views", path.join(rootDir, "views"));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err: unknown) => {
  if (err) {
    throw err;
  }
  console.log(`App is running on: http://localhost:${PORT}`);
});
