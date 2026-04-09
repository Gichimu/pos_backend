import express from "express";
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.js";
import { verify } from "../controllers/auth.js";
const router = express.Router();

router.get("/", verify, async (req: any, res: any) => {
  let results: any = await getCategories(req, res);
  if (results.error) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: results.error });
  } else {
    res.json(results);
  }
});

router.post("/", verify, async (req: any, res: any) => {
  let results: any = await addCategory(req, res);
  if (results.error) {
    res
      .status(500)
      .json({ message: "Failed to add category", error: results.error });
  } else {
    res.json(results);
  }
});

router.put("/:id", verify, async (req: any, res: any) => {
  let results: any = await updateCategory(req, res);
  if (results.error) {
    res
      .status(500)
      .json({ message: "Failed to update category", error: results.error });
  } else {
    res.json(results);
  }
});

router.delete("/:id", verify, async (req: any, res: any) => {
  let results: any = await deleteCategory(req, res);
  if (results.error) {
    res
      .status(500)
      .json({ message: "Failed to delete category", error: results.error });
  } else {
    res.json(results);
  }
});

export default router;
