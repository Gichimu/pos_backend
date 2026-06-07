import Shift from "../models/shift.js";
import Sale from "../models/sales.js";
import mongoose from "mongoose";

type salesSummary = {
  _id: string; // 'Cash' or 'M-Pesa'
  cash: number;
  mpesa: number;
}[];

const getShifts = async (req: any) => {
  try {
    const shifts = await Shift.find().sort({ startTime: -1 });
    // if (shifts.length === 0) {
    //   throw new Error("No shifts found");
    // }
    return shifts;
  } catch (error: any) {
    return { message: "Failed to get shifts", error: error.message };
  }
};

const openShift = async (req: any) => {
  const userId = req.body.openedBy ? req.body.openedBy : req.user._id;
  try {
    const existingOpenShift = await Shift.findOne({
      openedBy: userId,
      status: "Open",
    });
    if (existingOpenShift) {
      throw new Error("An open shift already exists for this user");
    }
    const newShift = new Shift({
      openedBy: userId,
      status: "Open",
      openingFloat: req.body.openingFloat || 0, // should default to 0 if no opening float is provided
    });
    await newShift.save();
    return newShift;
  } catch (error: any) {
    return { message: "Failed to open shift", error: error.message };
  }
};

const closeShift = async (req: any) => {
  const { actualCash, closingNotes, requisitions } = req.body;
  const shiftId = req.params.shiftId;

  try {
    // 1. Sum up all sales for this shift
    const salesSummary: salesSummary = await Sale.aggregate([
      {
        $match: {
          shiftId: new mongoose.Types.ObjectId(shiftId),
          confirmed: true,
        },
      },

      // 2. Project data into standardized, predictable cash/mpesa fields per document
      {
        $project: {
          mpesaContribution: {
            $cond: {
              if: { $eq: ["$paymentMethod", "M-Pesa"] },
              then: "$totalAmount",
              else: {
                $cond: {
                  if: { $eq: ["$paymentMethod", "Split"] },
                  then: { $ifNull: ["$splitAmounts.mpesaAmount", 0] },
                  else: 0,
                },
              },
            },
          },
          cashContribution: {
            $cond: {
              if: { $eq: ["$paymentMethod", "Cash"] },
              then: "$totalAmount",
              else: {
                $cond: {
                  if: { $eq: ["$paymentMethod", "Split"] },
                  then: { $ifNull: ["$splitAmounts.cashAmount", 0] },
                  else: 0,
                },
              },
            },
          },
        },
      },

      // 3. Accumulate everything together into a single summary document
      {
        $group: {
          _id: null, // Combine all matching records together
          mpesa: { $sum: "$mpesaContribution" },
          cash: { $sum: "$cashContribution" },
        },
      },

      // 4. Optional: Clean up the output formatting
      {
        $project: {
          _id: 0,
          mpesa: 1,
          cash: 1,
        },
      },
    ]);

    // 2. Format the summary
    const totals: any = { cash: 0, mpesa: 0 };
    if (salesSummary.length > 0) {
      totals.cash = salesSummary[0]?.cash || 0;
      totals.mpesa = salesSummary[0]?.mpesa || 0;
    }
    // 3. Update the Shift record
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      throw new Error("Shift not found");
    }
    const expectedCash = shift.openingFloat + totals.cash;
    console.log("found sales totals", totals);

    shift.endTime = new Date();
    shift.systemSales = salesSummary[0] || { cash: 0, mpesa: 0 };
    shift.requisitions = requisitions || [];
    shift.closingNotes = closingNotes ?? "";
    shift.actualCashCounted = actualCash;
    shift.closedBy = req.body.closedBy ? req.body.closedBy : req.user._id;
    // shift.variance = actualCash ? actualCash - expectedCash : expectedCash;
    shift.status = "Closed";

    await shift.save();
    return shift;
  } catch (error: any) {
    console.error("Error closing shift:", error);
    return { message: "Failed to close shift", error: error.message };
  }
};

export { closeShift, openShift, getShifts };
