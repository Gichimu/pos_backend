import mongoose from "mongoose";

const SystemLogSchema = new mongoose.Schema({
  logType: { type: String, enum: ["activity", "mutation"], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  ipAddress: { type: String },
  targetCollection: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  changes: {
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
  },

  // This field is required for the TTL index to calculate time differences
  timestamp: { type: Date, default: Date.now },
});

// CREATE THE PARTIAL TTL INDEX
// expireAfterSeconds: 2592000 balances out to exactly 30 days (60 days = 5184000)
SystemLogSchema.index(
  { timestamp: 1 },
  {
    expireAfterSeconds: 5184000, // 60 days in seconds
    partialFilterExpression: { logType: "activity" },
  },
);

// Standard high-performance query indexes
SystemLogSchema.index({ logType: 1, timestamp: -1 });

export default mongoose.model("SystemLog", SystemLogSchema);
