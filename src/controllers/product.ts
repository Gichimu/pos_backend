import Product from "../models/product.js";

const getAllProducts = async (req: any, res: any) => {
  try {
    let results = await Product.find();
    return results;
  } catch (error) {
    console.error("Error fetching products:", error);
    return { error: "Failed to fetch products" };
  }
};

const addProduct = async (req: any, res: any) => {
  try {
    const product = req.body;
    const newProduct = new Product(product);
    newProduct.createdBy = req.user.id;
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
};

const updateProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const product = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(id, product, {
      new: true,
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

const deleteProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export { getAllProducts, addProduct, updateProduct, deleteProduct };
