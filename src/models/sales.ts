import mongoose from "mongoose";
import Counter from "./counter.js";

const saleSchema = new mongoose.Schema(
  {
    saleId: {
      type: String,
      unique: true,
      sparse: true,
      match: /^\d{8}$/,
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
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
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

saleSchema.pre("validate", async function () {
  if (this.saleId) {
    return;
  }

  const counter = await Counter.findByIdAndUpdate(
    "saleId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  if (!counter) {
    throw new Error("Failed to generate saleId");
  }

  if (counter.seq > 99999999) {
    throw new Error("saleId sequence exceeded 8-digit limit");
  }

  this.saleId = counter.seq.toString().padStart(8, "0");
});

export default mongoose.model("Sale", saleSchema);
