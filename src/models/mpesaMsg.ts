import mongoose from "mongoose";

const mpesaMsgSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    mpesaCode: { type: String, required: true },
    customerName: { type: String, required: true },
    tillOrPaybill: { type: String, required: true },
    Date: { type: String, required: true },
  },
  { timestamps: true },
);

const MpesaMsg = mongoose.model("MpesaMsg", mpesaMsgSchema);
export default MpesaMsg;
