import User from "../models/user.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function getUsers() {
  try {
    let results = await User.find();
    return results;
  } catch (error) {
    console.error("Error fetching users:", error);
    return error;
  }
}

const createUser = async (req: any) => {
  if (
    !req.body ||
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.email ||
    !req.body.password
  ) {
    return { error: "Missing required fields" };
  }

  try {
    const existingUser = await User.findOne({
      email: new RegExp(`^${req.body.email}$`, "i"),
    });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    req.body.password = await bcrypt.hash(req.body.password, 10); // Hash the password before saving
    let user = new User(req.body);

    // create a random 5-digit PIN for cashiers if role includes 'cashier'
    if (user.roles.includes("cashier")) {
      user.pin = crypto.randomInt(10000, 99999).toString();
    }

    await user.save();

    // email the PIN to the cashier if they have a PIN (i.e., if they are a cashier)
    // if (user.pin) {
    //   await sendWelcomeEmail(user.email, user.firstName, user.pin);
    // }

    return user;
  } catch (error: any) {
    console.error("Error creating user:", error);
    //todo: handle duplicate email error and other validation errors more gracefully
    return { message: "Failed to create user", error: error };
  }
};

const updateUser = async (req: any) => {
  try {
    if (!req.body || !req.params.id) {
      return { error: "No data provided for update" };
    }
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } else {
      const userById = await User.findById(req.params.id);
      if (!userById) {
        return { error: "User not found" };
      } else {
        if (req.body.status === "inactive") {
          req.body.refreshToken = null; // Invalidate refresh token when user is deactivated
        }
        req.body.password = userById.password; // Keep existing password if not provided
      }
    }
    let user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Failed to update user" };
  }
};

const deleteUser = async (req: any) => {
  try {
    if (!req.params.id) {
      return { error: "No user ID provided" };
    }
    let user = await User.findByIdAndDelete(req.params.id);
    return user;
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
};

export { getUsers, createUser, updateUser, deleteUser };
