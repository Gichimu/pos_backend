import User from "../models/user.js";

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
    let user = new User(req.body);
    await user.save();
    console.log("User created successfully:", user);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Failed to create user" };
  }
};

export { getUsers, createUser };
