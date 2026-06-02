import TransactionLog from "../models/transactionLog.js";

export const logTransaction = async (transactionData: any) => {
  try {
    const transactionLog = new TransactionLog(transactionData);
    await transactionLog.save();
  } catch (error) {
    console.error("Error logging transaction:", error);
  }
};

export const getTransactionLogs = async (filter: any) => {
  const logs = await TransactionLog.find(filter).sort({ timestamp: -1 });
  return logs;
};
