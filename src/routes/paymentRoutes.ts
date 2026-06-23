import express from "express";
const router = express.Router();
import redisClient from "../utils/redis.js";
import { verifyNCBAHash } from "../utils/ncbaConfig.js";

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
  // You can check if an Order ID exists here
  res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Accepted",
  });
});

router.get("/shift-payments", async (req, res) => {
  const allPayments = await redisClient.hgetall("daily_shift");

  console.log("Retrieved payments from Redis:", allPayments);

  // Convert Redis object to a sorted array for your Angular table
  const result = Object.values(allPayments)
    .map((p: any) => JSON.parse(p))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  res.json(result);
});

router.post("/ncba-webhook", async (req, res) => {
  try {
    const payload: any = req.body; // NCBA sends the payload as a string in Body

    // 1. Authenticate that the incoming request is actually from NCBA
    if (
      payload.Username !== process.env.NCBA_WEBHOOK_USER ||
      payload.Password !== process.env.NCBA_WEBHOOK_PASS
    ) {
      console.warn("⚠️ Unauthorized webhook access attempt");
      return res
        .status(401)
        .json({ ResultCode: "1", ResultDesc: "Authentication Failed" });
    }

    // 2. Validate hash integrity to safeguard against fraud/spoofing
    // const isHashValid = await verifyNCBAHash(
    //   payload,
    //   process.env.NCBA_SECRET_KEY || "",
    // );
    // if (!isHashValid) {
    //   console.error(
    //     "❌ NCBA Webhook signature validation failed (Invalid Hash)",
    //   );
    //   return res
    //     .status(400)
    //     .json({ ResultCode: "1", ResultDesc: "Signature Mismatch" });
    // }

    // 3. Process the Payment info sent by the bank
    const mpesaCode = payload.TransID; // e.g., RKH71L7YCD
    const amount = parseFloat(payload.TransAmount); // e.g., 10.00
    const phoneNumber = payload.Mobile; // e.g., 254711111111
    const customerName = payload.name; // e.g., JOHN DOE
    const tillOrPaybill = payload.BusinessShortCode; // e.g., 880100
    const transactionDate = new Date(payload.TransTime); // e.g., 20230915123045

    console.log("✅ NCBA Webhook received:", {
      mpesaCode,
      amount,
      phoneNumber,
      customerName,
      tillOrPaybill,
      transactionDate,
    });

    // 4. Cache transaction into your 24-hour Redis Shift Buffer for admin reconciliation
    const redisKey = `shift:mpesa:${mpesaCode}`;
    await redisClient.setex(
      redisKey,
      86400,
      JSON.stringify({
        amount,
        phoneNumber,
        customerName,
        tillOrPaybill,
        timestamp: new Date(),
      }),
    );

    // 5. Respond with NCBA's mandatory Success signature
    return res.status(200).json({
      ResultCode: "0",
      ResultDesc: "Notification received and logged successfully",
    });
  } catch (error: any) {
    console.error("❌ Internal Webhook Error:", error);
    // Send standard failure back to bank so they re-queue and retry the notification later
    return res.status(500).json({
      ResultCode: "1",
      ResultDesc: "Internal Server Error",
    });
  }
});

export default router;
