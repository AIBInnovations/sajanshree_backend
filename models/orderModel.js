const mongoose = require("mongoose");

// Outcome of the WhatsApp order-confirmation message for this order.
// "sent" means Slide/Meta accepted the message, NOT that the customer received it —
// delivery receipts would need webhooks, which we don't consume yet.
const whatsappNotificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "queued",
        "sent",
        "failed",
        "disabled",              // no API key configured on the server
        "skipped_no_phone",
        "skipped_invalid_phone",
        "skipped_no_consent",
      ],
    },
    to: { type: String },        // the normalized number we actually sent to
    templateName: { type: String },
    languageCode: { type: String },
    wamid: { type: String },
    conversationId: { type: String },
    attempts: { type: Number, default: 0 },
    lastError: { type: String },
    lastErrorCode: { type: Number },
    lastAttemptAt: { type: Date },
    sentAt: { type: Date },
  },
  { _id: false }
);

// Define the schema for an Order
const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, sparse: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true },
    // Snapshot of the number as the admin typed it. Deliberately NOT read through
    // the `customer` ref: when no phone is given, customers are upserted by NAME,
    // so two different customers sharing a name collapse into one document and a
    // populated lookup could message the wrong person someone else's order.
    customerPhone: { type: String, trim: true },
    whatsappConsent: { type: Boolean, default: false },
    includeValueInWhatsApp: { type: Boolean, default: false },
    whatsappNotification: { type: whatsappNotificationSchema, default: undefined },
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
    orderImage: {
      url: { type: String },
      publicId: { type: String }
    },
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
