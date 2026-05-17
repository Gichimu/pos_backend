import axios from "axios";
import redisClient from "./redis.js";
import dotenv from "dotenv";

dotenv.config();

export async function getMpesaToken(): Promise<{
  accessToken: string | null;
  error: string | null;
}> {
  try {
    // 1. Try to get the token from your Redis "Shift Buffer"
    const cachedToken = await redisClient.get("mpesa_access_token");

    if (cachedToken) {
      console.log("🎟️ Using cached M-Pesa token");
      return { accessToken: cachedToken, error: null };
    }

    // 2. If no token, generate a new one
    console.log("🔄 Token expired. Generating new M-Pesa token...");

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
      "base64",
    );

    console.log("Requesting new M-Pesa token with credentials:", auth);

    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } },
    );

    const newToken = response.data.access_token;

    console.log("New M-Pesa token generated:", newToken);

    // 3. Save to Redis with a TTL (Time To Live)
    // Safaricom tokens last 3600s. We set 3300s (55 mins) to be safe.
    await redisClient.set("mpesa_access_token", newToken, "EX", 3300);

    return { accessToken: newToken, error: null };
  } catch (error: any) {
    console.error("❌ Failed to refresh M-Pesa token:", error.message);
    return { accessToken: null, error: error.message };
  }
}
