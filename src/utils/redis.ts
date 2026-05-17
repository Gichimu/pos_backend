import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();
// Railway automatically provides REDIS_URL in your environment variables
// const redisClient = new Redis(process.env.REDIS_URL + "?family=0"); // for prod
const redisClient = new Redis(process.env.REDIS_URL_DEV || "", {
  family: 0, // This helps resolve the DNS issue you're seeing
  connectTimeout: 10000,
});

redisClient.on("connect", () =>
  console.log("✅ Connected to Redis on Railway"),
);
redisClient.on("error", (err: any) =>
  console.error("❌ Redis Connection Error:", err),
);

export default redisClient;
