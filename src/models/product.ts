import mongoose from "mongoose";

const productType = ["menu", "menu-stock", "raw-stock"];

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    currentStock: { type: Number, default: 0 },
    stockReorderLevel: { type: Number, default: 10 },
    productType: { type: String, enum: productType, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    unit: { type: String }, // e.g., "kg", "liters", "pieces"
    inUse: { type: Boolean, default: true }, // Indicates if the product is active or discontinued
    hasRecipe: { type: Boolean, default: false }, // Indicates if the product has a recipe associated with it
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
