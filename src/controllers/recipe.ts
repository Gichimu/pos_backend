import Recipe from "../models/recipe.js";
import { writeAuditLog } from "../utils/sysTransactions.js";

const createRecipe = async (req: any) => {
  const data = req.body;
  if (!data) {
    return { error: "No recipe data provided" };
  }
  try {
    data.createdBy = req.user.id;
    const recipe = new Recipe(data);
    await writeAuditLog({
      userId: data.createdBy,
      action: "RECIPE_CREATE",
      description: `Recipe for ${recipe.menuItemName} added`,
      collection: "recipes",
      targetId: recipe._id,
      newData: recipe,
    });
    await recipe.save();
    return recipe;
  } catch (error: any) {
    return { error: error.message };
  }
};

const getRecipes = async () => {
  try {
    const recipes = await Recipe.find();
    return recipes;
  } catch (error: any) {
    return { error: error.message };
  }
};

const getRecipe = async (id: string) => {
  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return { error: "Recipe not found" };
    }
    return recipe;
  } catch (error: any) {
    return { error: error.message };
  }
};

const updateRecipe = async (id: string, req: any) => {
  const data = req.body;
  if (!data) {
    return { error: "No recipe data provided" };
  }
  try {
    data.updatedBy = req.user.id;
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return { error: "Recipe not found" };
    }
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedRecipe) {
      return { error: "Recipe not found" };
    }
    await writeAuditLog({
      userId: data.updatedBy,
      action: "RECIPE_UPDATE",
      description: `Recipe for ${recipe.menuItemName} updated`,
      collection: "recipes",
      targetId: recipe._id,
      oldData: recipe,
      newData: updatedRecipe,
    });
    return updatedRecipe;
  } catch (error: any) {
    return { error: error.message };
  }
};

const deleteRecipe = async (id: string, req: any) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) {
      return { error: "Recipe not found" };
    }
    await writeAuditLog({
      userId: req.user.id,
      action: "RECIPE_DELETE",
      description: `Recipe for ${recipe.menuItemName} deleted`,
      collection: "recipes",
      targetId: recipe._id,
      oldData: recipe,
    });
    return recipe;
  } catch (error: any) {
    return { error: error.message };
  }
};

export { createRecipe, getRecipes, getRecipe, updateRecipe, deleteRecipe };
