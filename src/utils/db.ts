import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const isDevelopment = process.env.NODE_ENV === "development";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      // Disables automatic index builds on startup in production
      autoIndex: !isDevelopment,
      maxPoolSize: 10, // Helps manage concurrent connections from Render instances
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging forever
    });
    mongoose.connection.on("index", (error) => {
      if (error) {
        console.error("⚠️ Mongoose failed to build index on the cloud:", error);
        process.exit(1);
      } else {
        console.log(
          "🚀 All cloud indexes (including Partial TTL) built successfully.",
        );
      }
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
