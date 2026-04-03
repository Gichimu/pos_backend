import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: String,
    category: String,
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    currentStock: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 10 },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
