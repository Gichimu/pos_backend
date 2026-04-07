import mongoose from "mongoose";

const roles = ["cashier", "manager", "superAdmin"];

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: roles,
      default: "cashier",
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
