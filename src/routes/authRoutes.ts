import express from "express";
const router = express.Router();

import { login, logout } from "../controllers/auth.js";

router.post("/login", async (req: any, res: any) => {
  let results: any = await login(req);
  if (results.error) {
    res.status(400).json({ message: "Failed to login", error: results.error });
  } else {
    res.json(results);
  }
});

router.post("/logout", async (req: any, res: any) => {
  let results: any = await logout(req);
  if (results.error) {
    res.status(400).json({ message: "Failed to logout", error: results.error });
  } else {
    res.json(results);
  }
});

export default router;
