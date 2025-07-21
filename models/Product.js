const mongoose = require("mongoose");

const detailSchema = new mongoose.Schema({
  label: { type: String, required: true },
  key: { type: String, required: true },
  options: [{ type: String, required: true }],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    sizes: [{ type: String, required: true }],
    details: [detailSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
