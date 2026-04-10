import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true }, // Snapshot of price at time of sale
        subTotal: { type: Number, required: true },
        confirmed: { type: Boolean, default: false }, // For pending sales that need confirmation
        paymentMethod: {
          type: String,
          enum: ["Cash", "M-Pesa", "PDQ"],
        },
      },
    ],
    totalAmount: { type: Number, required: true },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Sale", saleSchema);
