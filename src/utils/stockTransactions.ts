import Recipe from "../models/recipe.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

export async function processInventoryDeduction(
  menuItemId: mongoose.Types.ObjectId,
  quantitySold: number,
) {
  const recipe = await Recipe.findOne({ menuItemId });

  if (!recipe) return; // No recipe, no deduction (e.g., for bottled water)

  const updates = recipe.ingredients.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.ingredientId },
        // Calculate total: (10g per chapati) * 2 chapatis = 20g
        update: { $inc: { currentStock: -(item.quantity * quantitySold) } },
      },
    };
  });

  // Perform all updates at once for efficiency
  await Product.bulkWrite(updates);
}

export async function adjustMenuItemCurrentStock() {
  const menuItems = await getMenuWithAvailability(),
    menuItemMap = new Map(
      menuItems.map((item: any) => [item._id.toString(), item]),
    );

  const bulkOps = menuItems.map((item: any) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { currentStock: item.unitsAvailable },
    },
  }));

  await Product.bulkWrite(bulkOps);
}

export async function getMenuWithAvailability(
  subCategories: string[] = [
    "chicken",
    "beef",
    "snacks",
    "hot",
    "accompaniments",
    "meals",
    "seafood",
    "matumbo",
  ],
  excludedProductTypes: string[] = ["raw-stock"],
) {
  const match: Record<string, any> = {};

  if (subCategories?.length) {
    match.subCategory = { $in: subCategories };
  }

  if (excludedProductTypes?.length) {
    match.productType = { $nin: excludedProductTypes };
  }

  return await Product.aggregate([
    { $match: match },
    // 1. Join with the Recipe
    {
      $lookup: {
        from: "recipes",
        localField: "_id",
        foreignField: "menuItemId",
        as: "recipe",
      },
    },
    { $unwind: { path: "$recipe", preserveNullAndEmptyArrays: false } },

    // 2. Join each ingredient (stored as Products) in the recipe with its current stock
    {
      $lookup: {
        from: "products",
        localField: "recipe.ingredients.ingredientId",
        foreignField: "_id",
        as: "ingredientDetails",
      },
    },

    // 3. Calculate "Max Possible" for each ingredient
    {
      $addFields: {
        availabilityPerIngredient: {
          $map: {
            input: "$recipe.ingredients",
            as: "rec",
            in: {
              $let: {
                vars: {
                  // Find the matching ingredient from the joined details
                  ing: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$ingredientDetails",
                          as: "i",
                          cond: { $eq: ["$$i._id", "$$rec.ingredientId"] },
                        },
                      },
                      0,
                    ],
                  },
                },
                // Calculation: floor(CurrentStock / AmountUsedPerItem)
                in: {
                  $floor: {
                    $divide: ["$$ing.currentStock", "$$rec.quantity"],
                  },
                },
              },
            },
          },
        },
      },
    },

    // 4. Final Availability is the MINIMUM of all ingredient possibilities
    {
      $addFields: {
        unitsAvailable: {
          $cond: {
            if: {
              $gt: [
                { $size: { $ifNull: ["$availabilityPerIngredient", []] } },
                0,
              ],
            },
            then: { $min: "$availabilityPerIngredient" },
            else: 999, // Items without recipes (e.g., bottled water) are always available
          },
        },
      },
    },
  ]);
}
