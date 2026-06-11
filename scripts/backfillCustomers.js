// scripts/backfillCustomers.js
// Creates Customer records (and back-links orders) from the customerName already
// stored on existing orders. Idempotent: re-running only fills gaps.
// Run once: `node scripts/backfillCustomers.js`.
require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Customer = require("../models/customerModel");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Reconcile indexes so the new sparse-unique phone index replaces any old
    // non-sparse unique index (which would block multiple phone-less customers).
    await Customer.syncIndexes();
    console.log("✅ Customer indexes synced");

    const names = (await Order.distinct("customerName")).filter(
      (n) => n && String(n).trim()
    );
    console.log(`Found ${names.length} distinct customer name(s) on orders`);

    let created = 0;
    for (const name of names) {
      const existing = await Customer.findOne({ name });
      let customer = existing;
      if (!existing) {
        customer = await Customer.create({ name });
        created += 1;
        console.log(`  • Created customer "${name}"`);
      }
      // Back-link any orders for this name that don't yet have a customer ref.
      await Order.updateMany(
        { customerName: name, $or: [{ customer: { $exists: false } }, { customer: null }] },
        { $set: { customer: customer._id } }
      );
    }

    const total = await Customer.countDocuments();
    console.log(`✅ Backfill complete. Created ${created} new customer(s). Total customers: ${total}`);
  } catch (error) {
    console.error("❌ Backfill failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
