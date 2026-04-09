import express from "express";
import { createSale, getAllSales } from "../controllers/sales.js";
import { verify } from "../controllers/auth.js";
const router = express.Router();

router.get("/", verify, async (req: any, res: any) => {
  let results: any = await getAllSales();
  if (results.error) {
    res.status(500).json({ error: "Failed to fetch sales" });
  } else {
    res.json(results);
  }
});

router.post("/", verify, async (req: any, res: any) => {
  let results: any = await createSale(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to create sale", error: results.error });
  } else {
    res.status(201).json(results);
  }
});

export default router;
