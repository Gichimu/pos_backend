import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../utils/db.js";
import Counter from "../models/counter.js";
import Sale from "../models/sales.js";

dotenv.config();

// const backfillSaleIds = async () => {
//   await connectDB();

//   const highestSale = await Sale.find({ saleId: /^\d{8}$/ })
//     .sort({ saleId: -1 })
//     .select("saleId")
//     .lean();

//   const highestExisting = highestSale?.saleId
//     ? parseInt(highestSale.saleId as string, 10)
//     : 0;

//   const counter = await Counter.findByIdAndUpdate(
//     "saleId",
//     { $max: { seq: highestExisting } },
//     { new: true, upsert: true, setDefaultsOnInsert: true },
//   );

//   if (!counter) {
//     throw new Error("Failed to initialize saleId counter");
//   }

//   const salesWithoutId = await Sale.find({
//     $or: [
//       { saleId: { $exists: false } },
//       { saleId: null },
//       { saleId: "" },
//       { saleId: { $not: /^\d{8}$/ } },
//     ],
//   })
//     .sort({ createdAt: 1, _id: 1 })
//     .select("_id");

//   if (salesWithoutId.length === 0) {
//     console.log("No sales require backfill");
//     await mongoose.disconnect();
//     return;
//   }

//   const updates = [];
//   let nextSeq = counter.seq;
//   for (const sale of salesWithoutId) {
//     nextSeq += 1;
//     if (nextSeq > 99999999) {
//       throw new Error("saleId sequence exceeded 8-digit limit");
//     }
//     updates.push({
//       updateOne: {
//         filter: { _id: sale._id },
//         update: { $set: { saleId: nextSeq.toString().padStart(8, "0") } },
//       },
//     });
//   }

//   await Sale.bulkWrite(updates);
//   await Counter.findByIdAndUpdate("saleId", { $set: { seq: nextSeq } });
//   console.log(`Backfilled ${updates.length} sales`);

//   await mongoose.disconnect();
// };

// backfillSaleIds().catch(async (error) => {
//   console.error("Backfill failed:", error);
//   await mongoose.disconnect();
//   process.exit(1);
// });
