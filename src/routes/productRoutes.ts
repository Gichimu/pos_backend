import express from "express";

const router = express.Router();

import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/product.js";

// get all products
router.get("/", async (req: any, res: any) => {
  try {
    let products = await getAllProducts(req, res);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/", async (req: any, res: any) => {
  try {
    let addedProduct = await addProduct(req, res);
    res.status(201).json(addedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

router.put("/:id", async (req: any, res: any) => {
  try {
    let updatedProduct = await updateProduct(req, res);
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", async (req: any, res: any) => {
  try {
    await deleteProduct(req, res);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
