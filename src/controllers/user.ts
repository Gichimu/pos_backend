import User from "../models/user.js";
import bcrypt from "bcryptjs";

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
    req.body.password = await bcrypt.hash(req.body.password, 10); // Hash the password before saving
    let user = new User(req.body);
    await user.save();
    console.log("User created successfully:", user);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    //todo: handle duplicate email error and other validation errors more gracefully
    return { error: "Failed to create user" };
  }
};

const updateUser = async (req: any) => {
  try {
    if (!req.body || !req.params.id) {
      return { error: "No data provided for update" };
    }
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
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
