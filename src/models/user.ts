import mongoose from "mongoose";

const rolesEnum = ["cashier", "manager", "superAdmin"];

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    pin: { type: String }, // Optional field for cashier PIN
    refreshToken: { type: String }, // For JWT refresh tokens
    roles: {
      type: mongoose.Schema.Types.Mixed,
      enum: rolesEnum,
      required: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
