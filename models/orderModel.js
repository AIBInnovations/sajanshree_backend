const mongoose = require("mongoose");

// Define the schema for an Order
const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true }, // Added mobile number field
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Shipped"],
      default: "Pending",
    },
    product: { type: String, required: true }, // Product selection
    items: [
      {
        sizes: {
          type: Map,
          of: Number, // Stores size as key and quantity as value
          default: {},
        },
      },
    ],
    orderDescription: { type: String }, // Optional order details
    orderImage: { type: String }, // Stores the image file path or URL
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
