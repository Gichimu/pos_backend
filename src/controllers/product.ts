import Product from "../models/product.js";

const getAllProducts = async (req: any, res: any) => {
  try {
    let results = await Product.find();
    return results;
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return { message: "Failed to fetch products", error: error };
  }
};

const addProduct = async (req: any, res: any) => {
  try {
    const product = req.body;
    const productExists = await Product.findOne({
      name: new RegExp(`^${product.name}$`, "i"),
    });
    if (productExists) {
      throw new Error("Product with this name already exists");
    }
    console.log("Adding product:", product);
    const newProduct = new Product(product);
    if (newProduct?.productType === "raw-stock") {
      if (newProduct?.subCategory === "chicken") {
        // update all chicken products to updateProduct.currentStock
        await Product.updateMany(
          { subCategory: "chicken", productType: "raw-stock" },
          { currentStock: newProduct.currentStock },
        );
      } else if (newProduct?.subCategory === "beef") {
        // update all beef products to updateProduct.currentStock
        await Product.updateMany(
          { subCategory: "beef", productType: "raw-stock" },
          { currentStock: newProduct.currentStock },
        );
      }
    }
    newProduct.createdBy = req.user.id;
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error: any) {
    console.error("Error adding product:", error);
    res
      .status(500)
      .json({ message: "Failed to add product", error: error.message });
  }
};

const updateProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const product = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(id, product, {
      new: true,
    });
    if (updatedProduct?.productType === "raw-stock") {
      if (updatedProduct?.subCategory === "chicken") {
        // update all chicken products to updateProduct.currentStock
        await Product.updateMany(
          { subCategory: "chicken", productType: "raw-stock" },
          { currentStock: updatedProduct.currentStock },
        );
      } else if (updatedProduct?.subCategory === "beef") {
        // update all beef products to updateProduct.currentStock
        await Product.updateMany(
          { subCategory: "beef", productType: "raw-stock" },
          { currentStock: updatedProduct.currentStock },
        );
      }
    }
    res.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product", error: error });
  }
};

const deleteProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product", error: error });
  }
};

export { getAllProducts, addProduct, updateProduct, deleteProduct };
