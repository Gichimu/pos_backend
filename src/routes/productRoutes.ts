import express from "express";

const router = express.Router();

import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/product.js";
import { verify } from "../controllers/auth.js";

// get all products
router.get("/", verify, async (req: any, res: any) => {
  try {
    let products = await getAllProducts(req, res);
    res.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error });
  }
});

router.post("/", verify, async (req: any, res: any) => {
  try {
    let addedProduct = await addProduct(req, res);
    res.status(201).json(addedProduct);
  } catch (error: any) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Failed to add product", error: error });
  }
});

router.put("/:id", verify, async (req: any, res: any) => {
  try {
    let updatedProduct = await updateProduct(req, res);
    res.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product", error: error });
  }
});

router.delete("/:id", verify, async (req: any, res: any) => {
  try {
    await deleteProduct(req, res);
    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product", error: error });
  }
});

export default router;
