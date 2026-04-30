import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },

    // Financials
    openingFloat: { type: Number, default: 0 },

    // Reported by System
    systemSales: {
      cash: { type: Number, default: 0 },
      "m-pesa": { type: Number, default: 0 },
    },

    requisitions: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        quantity: { type: Number, default: 0 },
      },
    ],

    closingNotes: { type: String },

    // Entered by User during Reconciliation
    actualCashCounted: { type: Number, default: 0 },

    // Results
    variance: { type: Number, default: 0 }, // actual - (systemSales.cash + openingFloat)
    notes: String,
  },
  { timestamps: true },
);

export default mongoose.model("Shift", shiftSchema);
