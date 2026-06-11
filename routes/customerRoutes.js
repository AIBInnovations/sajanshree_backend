const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  getCustomerOrders,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, createCustomer);
router.get("/", protect, getCustomers);
router.get("/:id", protect, getCustomerById);
router.get("/:id/orders", protect, getCustomerOrders);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, deleteCustomer);

module.exports = router;
