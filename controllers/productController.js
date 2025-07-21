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

// @route PATCH /api/products/:productName/options
// @desc Add a new option to a specific detail field of a product
// @access Private
exports.addProductOption = async (req, res) => {
  try {
    const { productName } = req.params;
    const { detailKey, option } = req.body;

    if (!detailKey || !option) {
      return res
        .status(400)
        .json({ message: "Detail key and option are required" });
    }

    const product = await Product.findOne({ name: productName });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const detail = product.details.find((d) => d.key === detailKey);
    if (!detail) {
      return res.status(404).json({ message: "Detail field not found" });
    }

    if (detail.options.includes(option)) {
      return res.status(400).json({ message: "Option already exists" });
    }

    detail.options.push(option);
    await product.save();

    res.json(product);
  } catch (error) {
    console.error("Add option error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// const Product = require("../models/Product");

// // @route POST /api/products
// // @desc Create a new product configuration
// // @access Private
// exports.createProduct = async (req, res) => {
//   try {
//     const { name, sizes, details } = req.body;
//     const product = new Product({ name, sizes, details });
//     await product.save();
//     res.status(201).json(product);
//   } catch (error) {
//     console.error("Create product error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @route GET /api/products
// // @desc Fetch all product configurations
// // @access Private
// exports.getProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (error) {
//     console.error("Fetch products error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @route GET /api/products/:id
// // @desc Fetch a single product by ID
// // @access Private
// exports.getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res.json(product);
//   } catch (error) {
//     console.error("Fetch product error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @route PUT /api/products/:id
// // @desc Update a product configuration
// // @access Private
// exports.updateProduct = async (req, res) => {
//   try {
//     const { name, sizes, details } = req.body;
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       { name, sizes, details, updatedAt: Date.now() },
//       { new: true, runValidators: true }
//     );
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res.json(product);
//   } catch (error) {
//     console.error("Update product error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @route DELETE /api/products/:id
// // @desc Delete a product configuration
// // @access Private
// exports.deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res.json({ message: "Product deleted" });
//   } catch (error) {
//     console.error("Delete product error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
