import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: { type: String, enum: ["IN", "OUT", "ADJUSTMENT"], required: true },
    quantity: { type: Number, required: true },
    source: { type: String }, // e.g., "Supplier Name" or "Customer Return"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: String,
  },
  { timestamps: true },
);

export default mongoose.model("StockTransaction", stockTransactionSchema);
