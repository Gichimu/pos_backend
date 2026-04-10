import mongoose from "mongoose";
import Sales from "../models/sales.js";

const getAllSales = async (req: any) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (req.query.cashierId) {
    if (!mongoose.Types.ObjectId.isValid(req.query.cashierId as string)) {
      return { message: "Invalid cashierId" };
    }
    filter.cashierId = new mongoose.Types.ObjectId(
      req.query.cashierId as string,
    );
  }

  try {
    const [sales, total] = await Promise.all([
      Sales.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("cashierId", "username"),
      Sales.countDocuments(filter),
    ]);

    return {
      data: sales,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching sales:", error);
    return { message: "Failed to fetch sales", error: error };
  }
};

const createSale = async (req: any) => {
  if (!req.body) {
    return { message: "Required parameters are missing" };
  }
  try {
    const sale = req.body;
    const newSale = new Sales(sale);
    newSale.cashierId = req.user.id; // Assuming req.user is set by auth middleware
    await newSale.save();
    return newSale;
  } catch (error) {
    console.error("Error creating sale:", error);
    return { message: "Failed to create sale", error: error };
  }
};

const getSaleById = async (id: string) => {
  try {
    const sale = await Sales.findById(id).populate("cashierId", "username");
    return sale;
  } catch (error) {
    console.error("Error fetching sale:", error);
    return { message: "Failed to fetch sale", error: error };
  }
};

const confirmSale = async (req: any) => {
  const { saleId, itemId } = req.params;
  const { paymentMethod } = req.body;

  if (!paymentMethod) {
    return { message: "paymentMethod is required" };
  }

  try {
    const sale = await Sales.findOneAndUpdate(
      { _id: saleId, "items._id": itemId },
      {
        $set: {
          "items.$[elem].confirmed": true,
          "items.$[elem].paymentMethod": paymentMethod,
        },
      },
      {
        arrayFilters: [{ "elem._id": itemId }],
        new: true,
        runValidators: true,
      },
    );

    if (!sale) {
      return { message: "Sale not found" };
    }

    return sale;
  } catch (error) {
    console.error("Error confirming sale:", error);
    return { message: "Failed to confirm sale", error: error };
  }
};

export { getAllSales, createSale, getSaleById, confirmSale };
