import mongoose from "mongoose";
import Sales from "../models/sales.js";
import Product from "../models/product.js";
import Shift from "../models/shift.js";
import { request } from "http";
import {
  adjustMenuItemCurrentStock,
  processInventoryAddition,
  processInventoryDeduction,
} from "../utils/stockTransactions.js";

import redisClient from "../utils/redis.js";
import shift from "../models/shift.js";

const getAllSales = async (req: any) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit =
    req.query.limit && Math.min(100, Math.max(1, parseInt(req.query.limit)));
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

  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  try {
    if (!req.query.startDate || !req.query.endDate) {
      const openShifts = await Shift.find({ status: "Open" }).select("_id");
      if (openShifts.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      const openShiftIds = openShifts.map((s) => s._id);

      filter.shiftId = { $in: openShiftIds };
    }

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

const createSale = async (req: any, res: any) => {
  if (
    !req.body ||
    !Array.isArray(req.body.items) ||
    req.body.items.length === 0
  ) {
    return { message: "Required parameters are missing" };
  }

  //check for open shifts
  const openShift = await shift.findOne({ status: "Open" });

  if (!openShift) return { message: "No open shift" };

  // idempotency block: check if a sale with the same unique client-generated ID already exists
  const genericTimeWindow = new Date(Date.now() - 10000); // Last 10 seconds

  const potentialDuplicate = await Sales.findOne({
    cashierId: req.body.cashierId,
    totalAmount: req.body.totalAmount,
    createdAt: { $gte: genericTimeWindow },
  });

  if (potentialDuplicate) {
    console.warn("⚠️ Prevented a duplicate checkout loop storm!");
    // Return a 409 Conflict response with a clear message for the client to understand what happened
    return res.status(409).json({
      success: false,
      error:
        "Duplicate transaction detected. Please refresh your sales dashboard.",
    });
  }

  // End of idempotency block

  const quantityByProduct = new Map<string, number>();
  for (const item of req.body.items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      return {
        message: "Each sale item must include valid productId and quantity",
      };
    }

    const productId = item.productId.toString();
    const currentQuantity = quantityByProduct.get(productId) || 0;
    quantityByProduct.set(productId, currentQuantity + item.quantity);
  }

  const productIds = [...quantityByProduct.keys()].map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  try {
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "_id currentStock",
    );
    const productStockMap = new Map(
      products.map((product: any) => [
        product._id.toString(),
        product.currentStock,
      ]),
    );

    for (const [productId, quantity] of quantityByProduct.entries()) {
      const currentStock = productStockMap.get(productId);

      if (currentStock === undefined) {
        return { message: `Product not found: ${productId}` };
      }

      if (currentStock < quantity) {
        return {
          message: `Insufficient stock for product ${productId}. Available: ${currentStock}, requested: ${quantity}`,
        };
      }
    }

    const stockDeductionOps = [...quantityByProduct.entries()].map(
      ([productId, quantity]) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(productId) },
          update: { $inc: { currentStock: -quantity } },
        },
      }),
    );

    await Product.bulkWrite(stockDeductionOps);

    const sale = req.body;

    // ********** stock adjustments ************
    if (sale && sale.items) {
      for (const item of sale.items) {
        await processInventoryDeduction(item.productId!, item.quantity);
      }
      await adjustMenuItemCurrentStock(); //adjust beef and chicken items on the menu after deduction
    } else {
      throw new Error("Sale not found");
    }

    sale.shiftId = openShift._id; //ensure items are added to the open shift
    const newSale = new Sales(sale);
    newSale.cashierId = req.user.id; // Assuming req.user is set by auth middleware
    try {
      await newSale.save();
      //print receipt here
    } catch (saveError) {
      const rollbackOps = [...quantityByProduct.entries()].map(
        ([productId, quantity]) => ({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(productId) },
            update: { $inc: { currentStock: quantity } },
          },
        }),
      );

      await Product.bulkWrite(rollbackOps);
      throw saveError;
    }

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
  const { saleId } = req.params;
  const { paymentMethod, mpesaAmount, cashAmount, mpesaTransactionId } =
    req.body;

  if (!paymentMethod) {
    return { message: "paymentMethod is required" };
  }

  // const mpesaMessage = await redisClient.hget("daily_shift", mpesaTransactionId);

  // if (mpesaMessage) {
  //   const parsedMessage = JSON.parse(mpesaMessage);
  //   parsedMessage.isUsed = true;
  //   await redisClient.hset(
  //     "daily_shift",
  //     mpesaTransactionId,
  //     JSON.stringify(parsedMessage),
  //   );
  // }

  if (mpesaTransactionId && mpesaTransactionId.length > 0) {
    for (const mpesaCode of mpesaTransactionId) {
      // 1. Fetch the transaction from the "daily_shift" hash
      const mpesaMessage = await redisClient.hget("daily_shift", mpesaCode);

      if (mpesaMessage) {
        // 2. Parse the stringified JSON payload
        const parsedMessage = JSON.parse(mpesaMessage);

        // 3. Update the boolean usage flag
        parsedMessage.isUsed = true;

        // 4. Save the updated object back to Redis under its respective code field
        await redisClient.hset(
          "daily_shift",
          mpesaCode,
          JSON.stringify(parsedMessage),
        );

        console.log(`✅ Transaction ${mpesaCode} successfully marked as used.`);
      } else {
        console.warn(
          `⚠️ Transaction code ${mpesaCode} was not found in Redis.`,
        );
      }
    }
  }

  try {
    const sale = await Sales.findOneAndUpdate(
      { _id: saleId, confirmed: false },
      {
        $set: {
          confirmed: true,
          paymentMethod,
          mpesaTransactionId,
          confirmedBy: req.user.id, // Assuming req.user is set by auth middleware
          splitAmounts: {
            mpesaAmount: paymentMethod === "Split" ? mpesaAmount : undefined,
            cashAmount: paymentMethod === "Split" ? cashAmount : undefined,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    // deduct inventory for each item in the sale

    if (!sale) {
      throw new Error("Sale not found");
    }

    return sale;
  } catch (error) {
    console.error("Error confirming sale:", error);
    return { message: "Failed to confirm sale", error: error };
  }
};

const unconfirmSale = async (req: any) => {
  const { saleId } = req.params;
  try {
    const sale = await Sales.findOneAndUpdate(
      { _id: saleId },
      {
        $set: {
          confirmed: false,
          paymentMethod: null,
          confirmedBy: null, // Assuming req.user is set by auth middleware
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!sale) {
      throw new Error("Sale not found");
    }

    return sale;
  } catch (error) {
    console.error("Error unconfirming sale:", error);
    return { message: "Failed to unconfirm sale", error: error };
  }
};

const deleteSale = async (req: any) => {
  const { saleId } = req.params;

  try {
    const sale = await Sales.findOne({ _id: saleId });
    if (!sale) {
      throw new Error("Sale or sale item not found");
    }

    sale.items.forEach(async (item: any) => {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { currentStock: item.quantity } },
      );
    });

    const deletedSale = await Sales.findByIdAndDelete(saleId);

    if (deletedSale && deletedSale.items) {
      for (const item of deletedSale.items) {
        await processInventoryAddition(item.productId!, item.quantity);
      }
      await adjustMenuItemCurrentStock(); //adjust beef and chicken items on the menu after deduction
    } else {
      throw new Error("deletedSale not found");
    }

    return deletedSale;
  } catch (error) {
    console.error("Error deleting sale:", error);
    return { message: "Failed to delete sale", error: error };
  }
};

const voidSale = async (req: any) => {
  const { saleId } = req.params;

  try {
    const sale = await Sales.findOne({ _id: saleId });
    if (!sale) {
      throw new Error("Sale not found");
    }

    const voidedSale = await Sales.findByIdAndDelete(saleId);
    return voidedSale;
  } catch (error) {
    console.error("Error voiding sale:", error);
    return { message: "Failed to void sale", error: error };
  }
};

export {
  getAllSales,
  createSale,
  getSaleById,
  confirmSale,
  unconfirmSale,
  deleteSale,
  voidSale,
};
