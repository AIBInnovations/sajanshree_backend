const mongoose = require("mongoose");

// Define the schema for an Order
const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Shipped"],
      default: "Pending",
    },
    items: [
      {
        category: { type: String, required: true },
        sizes: {
          type: Map,
          of: Number,
          default: {},
        },
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
