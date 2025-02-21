const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderStatus
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware"); // ✅ Correct import

const router = express.Router();

// Order Routes
router.post("/", protect, createOrder); // Protected: Create an order
router.get("/", protect, getAllOrders); // Protected: Get all orders
router.get("/:id", protect, getOrderById); // Protected: Get order by ID
router.put("/:id", protect, updateOrder); // Protected: Update order
router.delete("/:id", protect, deleteOrder); // Protected: Delete order
router.put("/:id/status", protect, updateOrderStatus); // ✅ Protect this route

module.exports = router;
