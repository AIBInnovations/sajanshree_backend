const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  createorderOption,
  getorderOptions,
  getorderOptionById,
  updateorderOption,
  deleteorderOption,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // Import multer middleware

const router = express.Router();

// Order Routes
router.post("/", protect, upload.single("orderImage"), createOrder); // Now supports image upload
router.get("/", protect, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);

// Options Route
// @route POST /api/order-options
// @desc Creates a new order-option configuration with name, sizes, and details
// @req Body: { name: String, sizes: [String], details: [{ label: String, key: String, options: [String] }] }
// @res Status 201: Returns created order-option object
router.post("/order-options", createorderOption);

// @route GET /api/order-options
// @desc Fetches all order-option configurations
// @req None
// @res Status 200: Returns array of order-option objects
router.get("/order-options", getorderOptions);

// @route GET /api/order-options/:id
// @desc Fetches a single order-option by ID
// @req Params: { id: String }
// @res Status 200: Returns order-option object, Status 404: orderOption not found
router.get("/order-options/:id", getorderOptionById);

// @route PUT /api/order-options/:id
// @desc Updates a order-option configuration
// @req Params: { id: String }, Body: { name: String, sizes: [String], details: [{ label: String, key: String, options: [String] }] }
// @res Status 200: Returns updated order-option object, Status 404: orderOption not found
router.put("/order-options/:id", updateorderOption);

// @route DELETE /api/order-options/:id
// @desc Deletes a order-option configuration
// @req Params: { id: String }
// @res Status 200: Returns { message: 'orderOption deleted' }, Status 404: orderOption not found
router.delete("/order-options/:id", deleteorderOption);

module.exports = router;
