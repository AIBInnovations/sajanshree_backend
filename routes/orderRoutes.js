const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");
const { uploadOrderImage } = require("../config/cloudinary"); // Import Cloudinary upload

const router = express.Router();

// Order Routes
router.post("/", protect, uploadOrderImage.single("orderImage"), createOrder);
router.get("/", protect, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, uploadOrderImage.single("orderImage"), updateOrder);
router.delete("/:id", protect, deleteOrder);

module.exports = router;
