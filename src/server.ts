import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// import routes from "./routes/routes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import product from "./models/product.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// todo: add error handling middleware
// todo: add database connection

// Start the server
app.listen(port, async () => {
  await connectDB();
  console.log(`Server is running on port ${port}`);
});
