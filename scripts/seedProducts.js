// scripts/seedProducts.js
// Seeds the Products collection with the order-form configuration (sizes + detail fields).
// Idempotent: upserts each product by name. Run once: `node scripts/seedProducts.js`.
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const sizeMapping = {
  "Pant Elastic": ["20", "22", "24", "26", "28", "30", "32", "34", "36", "38", "40", "42", "44"],
  "Pant Belt": ["26", "28", "30", "32", "34", "36", "38/26", "38/28", "40/28", "40/30", "40/32", "40/34", "42/28", "42/30", "42/32", "42/34", "42/36", "42/38", "42/40"],
  "Skirt": ["14", "16", "18", "20", "22", "24", "26/28", "26/30", "26/32", "26/34", "26/36"],
  "Tunick": ["20", "22", "24", "26", "28", "30", "32", "34", "36", "38", "40", "42", "44"],
  "Blazer": ["20", "22", "24", "26", "28", "30", "32", "34", "36", "38", "40", "42", "44"],
  "Shirt": ["20", "22", "24", "26", "28", "30", "32", "34", "36", "38", "40", "42", "44"],
};

// Detail fields per product. Item #7 removals applied:
//  - Pant Elastic: removed "Elastic Type" (Color only)
//  - Pant Belt: removed "Material" and "Buckle Type" (Color only)
const detailMapping = {
  "Shirt": [
    { label: "Collar", key: "collarType", options: ["Pipeline", "Matching Collar", "Collar Patti", "Creation"] },
    { label: "Astin", key: "astinType", options: ["Patti", "Pipeline", "Luppi", "Creation"] },
    { label: "Front", key: "frontType", options: ["Patti", "Pipeline", "Creation"] },
    { label: "Mono", key: "mono", options: ["Yes", "No"] },
    { label: "Pocket", key: "pocketType", options: ["Pipeline", "Patti", "Creation"] },
    { label: "Color", key: "color", options: ["White", "Black", "Blue", "Red", "Other"] },
  ],
  "Tunick": [
    { label: "Color", key: "color", options: ["White", "Black", "Blue", "Red", "Pink", "Green", "Yellow", "Orange", "Purple", "Other"] },
  ],
  "Skirt": [
    { label: "Cloth Type", key: "clothType", options: ["Cotton", "Linen", "Silk", "Polyester"] },
    { label: "Length Type", key: "lengthType", options: ["Knee Length", "Midi", "Maxi", "Mini"] },
    { label: "Style", key: "style", options: ["A-Line", "Pencil", "Pleated", "Wrap"] },
    { label: "Color", key: "color", options: ["White", "Black", "Blue", "Red", "Other"] },
  ],
  "Blazer": [
    { label: "Cloth Type", key: "clothType", options: ["Wool", "Cotton", "Linen", "Synthetic"] },
    { label: "Button Style", key: "buttonStyle", options: ["Single Breasted", "Double Breasted"] },
    { label: "Lining Type", key: "liningType", options: ["Full Lined", "Half Lined", "Unlined"] },
    { label: "Color", key: "color", options: ["Black", "Navy", "Grey", "Beige", "Other"] },
  ],
  "Pant Elastic": [
    { label: "Color", key: "color", options: ["Black", "White", "Grey", "Other"] },
  ],
  "Pant Belt": [
    { label: "Color", key: "color", options: ["Black", "Brown", "Tan", "Other"] },
  ],
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    for (const name of Object.keys(sizeMapping)) {
      const sizes = sizeMapping[name];
      const details = detailMapping[name] || [];
      const result = await Product.findOneAndUpdate(
        { name },
        { name, sizes, details },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`  • Upserted "${name}" (${result.sizes.length} sizes, ${result.details.length} detail fields)`);
    }

    const total = await Product.countDocuments();
    console.log(`✅ Seed complete. Products in DB: ${total}`);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
