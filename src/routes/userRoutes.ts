import express from "express";
const router = express.Router();

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.js";
import { error } from "node:console";
import { verify } from "../controllers/auth.js";

// router.get("/", (req: Request, res: any) => {
//   res.json({ message: "Welcome to the POS API" });
// });

router.get("/", async (req: any, res: any) => {
  let results: any = await getUsers();
  if (results.error) {
    res.status(500).json({ error: "Failed to fetch users" });
  } else {
    res.json(results);
  }
});

router.post("/", verify, async (req: any, res: any) => {
  let results: any = await createUser(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to create user", error: results.error });
  } else {
    res.status(201).json(results);
  }
});

router.put("/:id", verify, async (req: any, res: any) => {
  let results: any = await updateUser(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to update user", error: results.error });
  } else {
    res.json(results);
  }
});

router.delete("/:id", verify, async (req: any, res: any) => {
  let results: any = await deleteUser(req);
  if (results.error) {
    res
      .status(400)
      .json({ message: "Failed to delete user", error: results.error });
  } else {
    res.json(results);
  }
});

export default router;
