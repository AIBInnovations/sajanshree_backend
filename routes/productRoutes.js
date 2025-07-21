const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// @route POST /api/products
// @desc Creates a new product configuration with name, sizes, and details
// @req Body: { name: String, sizes: [String], details: [{ label: String, key: String, options: [String] }] }
// @res Status 201: Returns created product object
router.post("/", createProduct);

// @route GET /api/products
// @desc Fetches all product configurations
// @req None
// @res Status 200: Returns array of product objects
router.get("/", getProducts);

// @route GET /api/products/:id
// @desc Fetches a single product by ID
// @req Params: { id: String }
// @res Status 200: Returns product object, Status 404: Product not found
router.get("/:id", getProductById);

// @route PUT /api/products/:id
// @desc Updates a product configuration
// @req Params: { id: String }, Body: { name: String, sizes: [String], details: [{ label: String, key: String, options: [String] }] }
// @res Status 200: Returns updated product object, Status 404: Product not found
router.put("/:id", updateProduct);

// @route DELETE /api/products/:id
// @desc Deletes a product configuration
// @req Params: { id: String }
// @res Status 200: Returns { message: 'Product deleted' }, Status 404: Product not found
router.delete("/:id", deleteProduct);

module.exports = router;
