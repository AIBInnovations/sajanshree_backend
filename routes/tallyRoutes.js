const express = require("express");
const {
  createInvoiceNotification,
  resendInvoiceWhatsApp,
} = require("../controllers/tallyController");
const tallyAuth = require("../middleware/tallyAuthMiddleware");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Machine route: called by the companion service on the shop PC, authenticated
// with the shared TALLY_API_KEY. No req.user exists behind tallyAuth.
router.post("/invoice-whatsapp", tallyAuth, createInvoiceNotification);

// Human route: an admin retrying a failed send from the dashboard, so it uses the
// normal JWT session rather than the machine key.
router.post("/invoices/:id/whatsapp", protect, resendInvoiceWhatsApp);

module.exports = router;
