const mongoose = require("mongoose");

// Define the schema for an Order
const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, sparse: true },
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Shipped"],
      default: "Pending",
    },
    product: { type: String, required: true },
    items: [
      {
        product: { type: String, required: true },
        sizes: {
          type: Map,
          of: new mongoose.Schema({
            quantity: { type: Number, default: 0 },
            price: { type: Number, default: 0 }
          }),
          default: {},
        },
        details: {
          type: Map,
          of: String,
          default: {}
        }
      },
    ],
    orderDescription: { type: String },
    orderImage: { type: String },
  },
  { timestamps: true }
);

// Pre-save hook to generate orderId if not provided
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
