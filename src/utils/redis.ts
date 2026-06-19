import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisURL =
  process.env.NODE_ENV === "production"
    ? process.env.REDIS_URL
    : process.env.REDIS_URL_DEV;

if (!redisURL) {
  console.error("❌ Redis URL is not defined in environment variables");
  process.exit(1);
}
// Railway automatically provides REDIS_URL in your environment variables
// const redisClient = new Redis(process.env.REDIS_URL + "?family=0"); // for prod
const redisClient = new Redis(redisURL, {
  family: 0,
  connectTimeout: 10000,
});

redisClient.on("connect", () =>
  console.log("✅ Connected to Redis server successfully"),
);
redisClient.on("error", (err: any) =>
  console.error("❌ Redis Connection Error:", err),
);

export default redisClient;
