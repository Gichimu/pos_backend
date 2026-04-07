import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes/routes.js";
import connectDB from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
app.use(cors());

app.use(express.json());
app.use("/api", routes);
app.use("/api/auth", authRoutes);

// todo: add error handling middleware
// todo: add database connection

// Start the server
app.listen(port, async () => {
  await connectDB();
  console.log(`Server is running on port ${port}`);
});
