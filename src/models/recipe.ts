import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
  menuItemName: { type: String, required: true },
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
  },
  ingredients: [
    {
      ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      ingredientName: { type: String, required: true },
      unit: { type: String, required: true }, // e.g., "kg", "liters", "pieces"
      quantity: { type: Number, required: true }, // e.g., 10 for 10g of flour
    },
  ],
  notes: { type: String },
});

export default mongoose.model("Recipe", RecipeSchema);
