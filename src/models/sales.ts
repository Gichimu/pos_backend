import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true }, // Snapshot of price at time of sale
        subTotal: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "M-Pesa", "Card"],
      required: true,
    },
    soldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    transactionDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Sale", saleSchema);
