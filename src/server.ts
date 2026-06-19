import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import connectDB from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { getMpesaToken } from "./utils/safConfig.js";
import recipe from "./models/recipe.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import logRoutes from "./routes/logRoutes.js";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/logs", logRoutes);

app.use(notFound);
app.use(errorHandler);

// consider moving this to the safConfig file
// const registerUrls = async () => {
//   const { accessToken, error } = await getMpesaToken();
//   if (error) {
//     console.error("Error occurred while fetching access token:", error);
//     return;
//   }
//   const response = await axios.post(
//     // "https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl", // Use sandbox URL for testing
//     "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
//     {
//       ShortCode: process.env.MPESA_TILL_NUMBER,
//       ResponseType: "Completed",
//       ConfirmationURL:
//         "https://your-railway-app.up.railway.app/api/payments/confirmation",
//       ValidationURL:
//         "https://your-railway-app.up.railway.app/api/payments/validation",
//     },
//     { headers: { Authorization: `Bearer ${accessToken}` } },
//   );
// };

// Start the server
app.listen(port, async () => {
  await connectDB();
  // await registerUrls();
  console.log(`Server is running on successfully`);
});
