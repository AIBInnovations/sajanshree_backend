const cron = require("node-cron");
const Order = require("../models/orderModel");
const TallyInvoice = require("../models/tallyInvoiceModel");
const { isWhatsAppConfigured } = require("../config/whatsapp");
const { sendOrderConfirmation, MAX_ATTEMPTS } = require("./orderNotifications");
const { sendInvoiceNotification } = require("./invoiceNotifications");

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

// Retry sweep for WhatsApp confirmations.
//
// The send in createOrder is fire-and-forget, so an in-flight message is lost if
// the host restarts or spins down (Render does this on idle) — leaving the order
// stuck at "queued" forever. This picks those up, along with retryable failures.
const WHATSAPP_SWEEP_BATCH = 20;
const WHATSAPP_SWEEP_SPACING_MS = 1200; // Slide allows 60/min per key; stay well under
const WHATSAPP_SWEEP_LOOKBACK_MS = 48 * 60 * 60 * 1000;

cron.schedule("*/15 * * * *", async () => {
  try {
    if (!isWhatsAppConfigured()) return;

    const pending = await Order.find({
      "whatsappNotification.status": { $in: ["queued", "failed"] },
      "whatsappNotification.attempts": { $lt: MAX_ATTEMPTS },
      createdAt: { $gt: new Date(Date.now() - WHATSAPP_SWEEP_LOOKBACK_MS) },
    })
      .select("_id orderId")
      .limit(WHATSAPP_SWEEP_BATCH);

    if (pending.length === 0) return;

    console.log(`🔄 WhatsApp sweep: retrying ${pending.length} order(s)...`);
    for (const order of pending) {
      await sendOrderConfirmation(order._id);
      await new Promise((resolve) => setTimeout(resolve, WHATSAPP_SWEEP_SPACING_MS));
    }
    console.log("✅ WhatsApp sweep finished.");
  } catch (error) {
    console.error("❌ Error running WhatsApp sweep:", error.message);
  }
});

// The same sweep for invoices pushed from TallyPrime. Kept as a separate schedule
// rather than folded into the order sweep: the two share a Slide rate limit, and
// interleaving them in one loop would let a backlog of orders starve invoices
// (or the reverse) behind the batch cap.
cron.schedule("7-59/15 * * * *", async () => {
  try {
    if (!isWhatsAppConfigured()) return;

    const pending = await TallyInvoice.find({
      "whatsappNotification.status": { $in: ["queued", "failed"] },
      "whatsappNotification.attempts": { $lt: MAX_ATTEMPTS },
      createdAt: { $gt: new Date(Date.now() - WHATSAPP_SWEEP_LOOKBACK_MS) },
    })
      .select("_id voucherNumber")
      .limit(WHATSAPP_SWEEP_BATCH);

    if (pending.length === 0) return;

    console.log(`🔄 Tally invoice sweep: retrying ${pending.length} invoice(s)...`);
    for (const invoice of pending) {
      await sendInvoiceNotification(invoice._id);
      await new Promise((resolve) => setTimeout(resolve, WHATSAPP_SWEEP_SPACING_MS));
    }
    console.log("✅ Tally invoice sweep finished.");
  } catch (error) {
    console.error("❌ Error running Tally invoice sweep:", error.message);
  }
});

module.exports = cron;
