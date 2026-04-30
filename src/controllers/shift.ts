import Shift from "../models/shift.js";
import Sale from "../models/sales.js";
import mongoose from "mongoose";

type salesSummary = {
  _id: string; // 'Cash' or 'M-Pesa'
  total: number;
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
      { $match: { shiftId: new mongoose.Types.ObjectId(shiftId) } },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.paymentMethod", // 'Cash' or 'M-Pesa'
          total: { $sum: "$items.subTotal" },
        },
      },
    ]);

    // 2. Format the summary
    const totals: any = { cash: 0, "m-pesa": 0 };
    salesSummary.forEach((s) => (totals[s._id?.toLowerCase()] = s.total));

    // 3. Update the Shift record
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      throw new Error("Shift not found");
    }
    const expectedCash = shift.openingFloat + totals.cash;
    console.log("found sales totals", totals);

    shift.endTime = new Date();
    shift.systemSales = totals;
    shift.requisitions = requisitions || [];
    shift.closingNotes = closingNotes ?? "";
    shift.actualCashCounted = actualCash;
    shift.closedBy = req.body.closedBy ? req.body.closedBy : req.user._id;
    shift.variance = actualCash ? actualCash - expectedCash : expectedCash;
    shift.status = "Closed";

    await shift.save();
    return shift;
  } catch (error: any) {
    return { message: "Failed to close shift", error: error.message };
  }
};

export { closeShift, openShift, getShifts };
