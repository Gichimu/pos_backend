import type mongoose from "mongoose";
import SystemLog from "../models/transactionLog.js";

type LogPayload = {
  userId: string;
  action: string;
  description: string;
  req?: any; // Optional Express request object for capturing IP address
  collection?: string | null;
  targetCollection?: string | null;
  targetId?: mongoose.Types.ObjectId;
  oldData?: any;
  newData?: any;
};

export async function writeActivityLog({
  userId,
  action,
  description,
  req = null,
}: LogPayload) {
  try {
    // Optionally capture the client's IP address if the Express 'req' object is passed
    let ipAddress = "unknown";
    if (req) {
      ipAddress =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    }

    const log = await SystemLog.create({
      logType: "activity",
      userId,
      action, // e.g., 'USER_LOGIN', 'SHIFT_START', 'SHIFT_CLOSE'
      description, // e.g., 'Cashier Jane opened the morning shift'
      ipAddress,
      // timestamp is automatically generated as Date.now by the schema
    });
    console.log("✅ Activity log written:", log);
  } catch (error: any) {
    // Ensure log failures never interrupt actual user actions
    console.error("❌ Failed to write general activity log:", error.message);
  }
}

export async function writeAuditLog({
  userId,
  action,
  description,
  collection = null,
  targetCollection = null,
  targetId,
  oldData,
  newData,
}: LogPayload) {
  try {
    const createdLog = await SystemLog.create({
      logType: "mutation",
      userId,
      action,
      description,
      targetCollection: collection ?? targetCollection,
      targetId: targetId ?? null,
      changes: getObjectChanges(oldData, newData),
    });
    console.log("✅ Audit log written:", createdLog);
  } catch (err: any) {
    console.error("❌ Audit Log Error:", err.message);
  }
}

/**
 * Recursively compares two objects/arrays to extract precise structural changes.
 */
function getObjectChanges(oldObj: any, newObj: any) {
  // Convert Mongoose documents to plain objects
  const oldRaw = oldObj && oldObj.toObject ? oldObj.toObject() : oldObj;
  const newRaw = newObj && newObj.toObject ? newObj.toObject() : newObj;

  // Handle case where one side is null/undefined
  if (!oldRaw || !newRaw) {
    return oldRaw !== newRaw ? { oldValue: oldRaw, newValue: newRaw } : null;
  }

  // Handle Dates explicitly (JavaScript objects treat them uniquely)
  if (oldRaw instanceof Date || newRaw instanceof Date) {
    const oldTime =
      oldRaw instanceof Date ? oldRaw.getTime() : new Date(oldRaw).getTime();
    const newTime =
      newRaw instanceof Date ? newRaw.getTime() : new Date(newRaw).getTime();
    return oldTime !== newTime ? { oldValue: oldRaw, newValue: newRaw } : null;
  }

  // Handle Arrays
  if (Array.isArray(oldRaw) && Array.isArray(newRaw)) {
    if (JSON.stringify(oldRaw) !== JSON.stringify(newRaw)) {
      return { oldValue: oldRaw, newValue: newRaw };
    }
    return null;
  }

  // Handle Objects
  if (typeof oldRaw === "object" && typeof newRaw === "object") {
    const oldValue: any = {};
    const newValue: any = {};
    let hasChanges = false;

    const ignoredFields = [
      "_id",
      "__v",
      "updatedAt",
      "createdAt",
      "lastRestocked",
    ];
    const allKeys = new Set([...Object.keys(oldRaw), ...Object.keys(newRaw)]);

    for (const key of allKeys) {
      if (ignoredFields.includes(key)) continue;

      const oldVal = oldRaw[key];
      const newVal = newRaw[key];

      // If both are objects/arrays, dive deeper recursively
      if (
        typeof oldVal === "object" &&
        typeof newVal === "object" &&
        oldVal !== null &&
        newVal !== null
      ) {
        const deepDiff = getObjectChanges(oldVal, newVal);
        if (deepDiff) {
          oldValue[key] = deepDiff.oldValue;
          newValue[key] = deepDiff.newValue;
          hasChanges = true;
        }
      }
      // Primitive comparison
      else if (oldVal !== newVal) {
        oldValue[key] = oldVal;
        newValue[key] = newVal;
        hasChanges = true;
      }
    }

    return hasChanges ? { oldValue, newValue } : null;
  }

  // Fallback fallback primitive comparison
  return oldRaw !== newRaw ? { oldValue: oldRaw, newValue: newRaw } : null;
}
