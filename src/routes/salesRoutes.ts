import express from "express";
import {
  createSale,
  getAllSales,
  confirmSale,
  unconfirmSale,
  deleteSale,
  voidSale,
} from "../controllers/sales.js";
import { verify } from "../controllers/auth.js";
const router = express.Router();

router.get("/", verify, async (req: any, res: any) => {
  let results: any = await getAllSales(req);
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

router.patch("/:saleId/confirm", verify, async (req: any, res: any) => {
  let results: any = await confirmSale(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to confirm sale", error: results.error });
  } else if (results.message) {
    res.status(404).json({ message: results.message });
  } else {
    res.json(results);
  }
});

router.patch("/:saleId/unconfirm", verify, async (req: any, res: any) => {
  let results: any = await unconfirmSale(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to unconfirm sale", error: results.error });
  } else if (results.message) {
    res.status(404).json({ message: results.message });
  } else {
    res.json(results);
  }
});

router.delete("/:saleId", verify, async (req: any, res: any) => {
  let results: any = await deleteSale(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to delete sale", error: results.error });
  } else if (results.message) {
    res.status(404).json({ message: results.message });
  } else {
    res.json(results);
  }
});

router.post("/:saleId/void", verify, async (req: any, res: any) => {
  let results: any = await voidSale(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to void sale", error: results.error });
  } else if (results.message) {
    res.status(404).json({ message: results.message });
  } else {
    res.json(results);
  }
});

export default router;
