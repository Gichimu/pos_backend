import express from "express";
const router = express.Router();

import { getLogs } from "../controllers/transactionLog.js";

router.get("/", async (req: any, res: any) => {
  let results: any = await getLogs(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to fetch logs", error: results.error });
  } else {
    res.status(200).json(results.logs);
  }
});

export default router;
