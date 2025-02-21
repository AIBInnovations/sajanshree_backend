const cron = require("node-cron");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");

// Scheduled job to check for overdue orders daily
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🔄 Running cron job: Checking overdue orders...");

    // Get today's date
    const today = new Date();

    // Find all orders that are overdue and still marked as "Pending"
    const overdueOrders = await Order.find({
      deliveryDate: { $lt: today },
      status: "Pending",
    });

    if (overdueOrders.length > 0) {
      console.log(`⚠️ Found ${overdueOrders.length} overdue orders. Updating status...`);

      // Update status of all overdue orders to "Processing"
      for (const order of overdueOrders) {
        order.status = "Processing";
        await order.save();
      }

      console.log("✅ Overdue orders updated successfully.");
    } else {
      console.log("✅ No overdue orders found.");
    }
  } catch (error) {
    console.error("❌ Error running cron job:", error);
  }
});

module.exports = cron;
