import Sales from "../models/sales.js";

const getAllSales = async () => {
  try {
    const sales = await Sales.find()
      .sort({ createdAt: -1 })
      .populate("cashierId", "username");
    return sales;
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

export { getAllSales, createSale, getSaleById };
