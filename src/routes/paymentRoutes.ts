import express from "express";
const router = express.Router();
import redisClient from "../utils/redis.js";

router.post("/confirmation", async (req, res) => {
  const p = req.body;
  const transId = p.TransID;

  const paymentData = {
    transId: transId,
    amount: p.TransAmount,
    name: `${p.FirstName} ${p.LastName || ""}`,
    phone: p.MSISDN,
    time: new Date().toISOString(),
  };

  // Store in a Hash called 'daily_shift'
  // This allows the admin to see all payments at once
  await redisClient.hset("daily_shift", transId, JSON.stringify(paymentData));

  // Set the entire collection to expire in 14 hours (safety margin)
  // 14 hours * 60 min * 60 sec = 50,400
  await redisClient.expire("daily_shift", 50400);

  res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
});

router.post("/validation", (req, res) => {
  console.log("Validating Transaction:", req.body);
  // You can check if an Order ID exists here
  res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Accepted",
  });
});

router.get("/shift-payments", async (req, res) => {
  const allPayments = await redisClient.hgetall("daily_shift");

  // Convert Redis object to a sorted array for your Angular table
  const result = Object.values(allPayments)
    .map((p: any) => JSON.parse(p))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  res.json(result);
});

export default router;
