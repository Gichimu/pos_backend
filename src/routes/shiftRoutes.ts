import express from "express";
import { verify } from "../controllers/auth.js";
import { openShift, closeShift, getShifts } from "../controllers/shift.js";

const router = express.Router();
router.post("/start", verify, async (req: any, res: any) => {
  let results: any = await openShift(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to start shift", error: results.error });
  } else {
    res.status(201).json(results);
  }
});

router.post("/:shiftId/close", verify, async (req: any, res: any) => {
  let results: any = await closeShift(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to end shift", error: results.error });
  } else {
    res.status(200).json(results);
  }
});

router.get("/", verify, async (req: any, res: any) => {
  let results: any = await getShifts(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to get shifts", error: results.error });
  } else {
    res.status(200).json(results);
  }
});

export default router;
