const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Optional + sparse-unique: customers derived from orders may not have a phone,
    // and multiple phone-less customers must be allowed (sparse skips them in the unique index).
    phone: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String },
    gstNumber: { type: String },
    companyName: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
