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
  console.log("Login attempt for email:", email);
  // find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return { error: "User not found" };
  }
  console.log("User found:", user);
  // check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { error: "Invalid credentials" };
  } else {
    //todo: generate and return JWT token for authenticated sessions
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    return { message: "Login successful", user: user, token: token };
  }
};

const logout = async (req: any) => {
  // Implementation for logout functionality
  // Since JWT is stateless, we can't really "logout" on the server side without implementing token blacklisting.
};

export { login, logout };
