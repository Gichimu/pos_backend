import SystemLog from "../models/transactionLog.js";
import { constructDateFilter } from "../utils/utils.js";

const getLogs = async (req: any) => {
  try {
    const filter: any = {};
    if (req.query.type) {
      filter.logType = req.query.type;
    } else if (req.query.from || req.query.to) {
      Object.assign(filter, constructDateFilter(req.query.from, req.query.to));
    } else if (req.query.targetId) {
      filter.targetId = req.query.targetId;
      filter.logType = "mutation";
    }
    const logs = await SystemLog.find(filter).sort({ timestamp: -1 });
    return { logs };
  } catch (error) {
    return { error };
  }
};

export { getLogs };
