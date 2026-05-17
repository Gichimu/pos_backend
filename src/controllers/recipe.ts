import Recipe from "../models/recipe.js";

const createRecipe = async (data: any) => {
  try {
    const recipe = new Recipe(data);
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

const updateRecipe = async (id: string, data: any) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(id, data, { new: true });
    if (!recipe) {
      return { error: "Recipe not found" };
    }
    return recipe;
  } catch (error: any) {
    return { error: error.message };
  }
};

const deleteRecipe = async (id: string) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) {
      return { error: "Recipe not found" };
    }
    return recipe;
  } catch (error: any) {
    return { error: error.message };
  }
};

export { createRecipe, getRecipes, getRecipe, updateRecipe, deleteRecipe };
