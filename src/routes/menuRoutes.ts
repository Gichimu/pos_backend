import express from "express";
const router = express.Router();
import { getMenuWithAvailability } from "../utils/stockTransactions.js";

router.get("/", async (req: any, res: any) => {
  let results: any = await getMenuWithAvailability();
  res.json(results);
});

export default router;
