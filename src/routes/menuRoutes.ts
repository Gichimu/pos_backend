import express from "express";
const router = express.Router();
import { getMenuWithAvailability } from "../utils/stockTransactions.js";

router.get("/", async (req: any, res: any) => {
  const subCategories = req.query.subCategories
    ? typeof req.query.subCategories === "string"
      ? req.query.subCategories
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : Array.isArray(req.query.subCategories)
        ? req.query.subCategories
        : undefined
    : undefined;

  const excludeProductTypes = req.query.excludeProductTypes
    ? typeof req.query.excludeProductTypes === "string"
      ? req.query.excludeProductTypes
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : Array.isArray(req.query.excludeProductTypes)
        ? req.query.excludeProductTypes
        : undefined
    : undefined;

  let results: any = await getMenuWithAvailability(
    subCategories,
    excludeProductTypes,
  );
  res.json(results);
});

export default router;
