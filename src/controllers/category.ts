import Category from "../models/category.js";
import { writeAuditLog } from "../utils/sysTransactions.js";

const getCategories = async (req: any, res: any) => {
  // Implementation for fetching categories
  try {
    let categories = await Category.find();
    return categories;
  } catch (error) {
    return { message: "Failed to fetch categories", error };
  }
};

const addCategory = async (req: any, res: any) => {
  if (!req.body || !req.body.name) {
    return { error: "Required fields are missing" };
  }
  // Implementation for adding a new category
  try {
    let category = new Category(req.body);
    category.createdBy = req.user.id;
    await writeAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "CATEGORY_CREATE",
      description: `Category added: ${category.name}`,
      collection: "categories",
      targetId: category._id,
      newData: category,
    });
    await category.save();
    return category;
  } catch (error) {
    return { message: "Failed to add category", error };
  }
};

const updateCategory = async (req: any, res: any) => {
  if (!req.body || !req.params.id) {
    return { error: "Required fields are missing" };
  }
  // Implementation for updating an existing category

  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return { error: "Category not found" };
    }

    let newcategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );
    if (!newcategory) {
      return { error: "Category not found" };
    }
    await writeAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "CATEGORY_UPDATE",
      description: `Category updated: ${category.name}`,
      collection: "categories",
      targetId: category._id,
      oldData: category,
      newData: newcategory,
    });
    return newcategory;
  } catch (error) {
    return { message: "Failed to update category", error };
  }
};

const deleteCategory = async (req: any, res: any) => {
  if (!req.params.id) {
    return { error: "Category ID is required" };
  }
  // Implementation for deleting a category
  try {
    let category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return { error: "Category not found" };
    }
    await writeAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "CATEGORY_DELETE",
      description: `Category deleted: ${category.name}`,
      collection: "categories",
      targetId: category._id,
      oldData: category,
    });
    return { message: "Category deleted successfully", category };
  } catch (error) {
    return { message: "Failed to delete category", error };
  }
};

export { getCategories, addCategory, updateCategory, deleteCategory };
