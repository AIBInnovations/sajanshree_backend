const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
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

module.exports = router;
