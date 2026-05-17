// Simple simulation of the aggregate logic for `getMenuWithAvailability`

type Product = {
  _id: string;
  name: string;
  productType: "menu" | "raw-stock";
  currentStock?: number;
};

type Recipe = {
  menuItemId: string;
  ingredients: { ingredientId: string; quantity: number }[];
};

const products: Product[] = [
  { _id: "p1", name: "Chapati", productType: "menu" },
  { _id: "i1", name: "Flour", productType: "raw-stock", currentStock: 1000 },
  { _id: "i2", name: "Water", productType: "raw-stock", currentStock: 2000 },
  { _id: "i3", name: "Salt", productType: "raw-stock", currentStock: 3 },
];

const recipes: Recipe[] = [
  {
    menuItemId: "p1",
    ingredients: [
      { ingredientId: "i1", quantity: 100 }, // 100g flour per chapati
      { ingredientId: "i2", quantity: 50 }, // 50ml water per chapati
      { ingredientId: "i3", quantity: 1 }, // 1 unit salt per chapati
    ],
  },
];

function computeAvailability(products: Product[], recipes: Recipe[]) {
  const menuProducts = products.filter((p) => p.productType === "menu");

  return menuProducts.map((menu) => {
    const recipe = recipes.find((r) => r.menuItemId === menu._id);

    if (!recipe) return { menu: menu.name, unitsAvailable: 999, availabilityPerIngredient: [] };

    const availabilityPerIngredient = recipe.ingredients.map((rec) => {
      const ing = products.find((p) => p._id === rec.ingredientId);
      const avail = ing && typeof ing.currentStock === "number" ? Math.floor(ing.currentStock / rec.quantity) : 0;
      return avail;
    });

    const unitsAvailable = availabilityPerIngredient.length > 0 ? Math.min(...availabilityPerIngredient) : 999;

    return { menu: menu.name, unitsAvailable, availabilityPerIngredient };
  });
}

const result = computeAvailability(products, recipes);
console.log(JSON.stringify(result, null, 2));

// Expected: Flour -> 1000/100 = 10, Water -> 2000/50 = 40, Salt -> 3/1 = 3 => min = 3
