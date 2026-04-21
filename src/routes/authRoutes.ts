import express from "express";
const router = express.Router();

import {
  confimAccount,
  login,
  logout,
  tokenRefresh,
} from "../controllers/auth.js";

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

router.post("/refresh-token", async (req: any, res: any) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }
  // Call your refresh token controller function here
  let results: any = await tokenRefresh(refreshToken);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to refresh token", error: results.error });
  } else {
    res.json(results);
  }
});

router.post("/confirm-account", async (req: any, res: any) => {
  console.log("Confirm account request body:", req.body); // Debug log
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ message: "Required parameters missing!" });
  }
  let results = await confimAccount(userId, newPassword);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to activate account", error: results.error });
  } else {
    res.json(results);
  }
});

export default router;
