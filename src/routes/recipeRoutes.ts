import express from "express";
const router = express.Router();

import {
  createRecipe,
  getRecipes,
  getRecipe,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipe.js";
import { verify } from "../controllers/auth.js";

router.get("/", verify, async (req: any, res: any) => {
  let results: any = await getRecipes();
  if (results.error) {
    return res.status(500).json({ error: results.error });
  }
  res.json(results);
});

router.get("/:id", verify, async (req: any, res: any) => {
  const { id } = req.params;
  let results: any = await getRecipe(id);
  if (results.error) {
    return res.status(404).json({ error: results.error });
  }
  res.json(results);
});

router.post("/", verify, async (req: any, res: any) => {
  let results: any = await createRecipe(req.body);
  if (results.error) {
    return res.status(400).json({ error: results.error });
  }
  res.status(201).json(results);
});

router.put("/:id", verify, async (req: any, res: any) => {
  const { id } = req.params;
  let results: any = await updateRecipe(id, req.body);
  if (results.error) {
    return res.status(400).json({ error: results.error });
  }
  res.json(results);
});

router.delete("/:id", verify, async (req: any, res: any) => {
  const { id } = req.params;
  let results: any = await deleteRecipe(id);
  if (results.error) {
    return res.status(400).json({ error: results.error });
  }
  res.json(results);
});

export default router;
