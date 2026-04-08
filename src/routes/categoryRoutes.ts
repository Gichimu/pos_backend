import express from "express";
const router = express.Router();

router.get("/", (req: any, res: any) => {
  res.json({ message: "Welcome to the POS API" });
});

export default router;
