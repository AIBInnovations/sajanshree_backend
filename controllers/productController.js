const Product = require("../models/Product");

// @route POST /api/products
// @desc Create a new product configuration
// @access Private
exports.createProduct = async (req, res) => {
  try {
    const { name, sizes, details } = req.body;
    const product = new Product({ name, sizes, details });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route GET /api/products
// @desc Fetch all product configurations
// @access Private
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route GET /api/products/:id
// @desc Fetch a single product by ID
// @access Private
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Fetch product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route PUT /api/products/:id
// @desc Update a product configuration
// @access Private
exports.updateProduct = async (req, res) => {
  try {
    const { name, sizes, details } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, sizes, details, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route DELETE /api/products/:id
// @desc Delete a product configuration
// @access Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
