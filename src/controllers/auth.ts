import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
import crypto from "crypto";

const login = async (req: any) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return { error: "Required parameters missing" };
  }
  const { email, password } = req.body;

  // find user by email
  const user = await User.findOne({ email, status: "active" });
  if (!user) {
    return { error: "User not found" };
  }

  // check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { error: "Invalid credentials" };
  } else {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "15m",
    });
    const refreshToken = crypto.randomBytes(40).toString("hex");
    user.refreshToken = refreshToken;
    await user.save();
    return {
      message: "Login successful",
      user: user,
      token: token,
      refreshToken: refreshToken,
    };
  }
};

const tokenRefresh = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }
    const user = await User.findOne({ refreshToken });
    if (!user) {
      throw new Error("Invalid refresh token");
    }

    // recycle the refresh token by generating a new one and saving it to the user document
    const newRefreshToken = crypto.randomBytes(40).toString("hex");
    user.refreshToken = newRefreshToken;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "24h",
    });
    return {
      message: "Token refreshed successfully",
      token,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return { message: "Failed to refresh token", error: error };
  }
};

const verify = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // Attach decoded user info to request object
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const logout = async (req: any) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return { error: "Refresh token is required" };
  }
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return { error: "Invalid refresh token" };
  }
  user.refreshToken = null;
  await user.save();
  return { message: "Logout successful" };
};

const confimAccount = async (id: string, password: string) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    // hash the password before saving and set account status to active
    user.password = await bcrypt.hash(password, 10);
    user.status = "active";
    await user.save();
    return { message: "Account confirmed successfully" };
  } catch (error) {
    console.error("Error confirming account:", error);
    return { message: "Failed to confirm account", error: error };
  }
};

export { login, logout, verify, tokenRefresh, confimAccount };
