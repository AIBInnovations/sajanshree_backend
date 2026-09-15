const mongoose = require("mongoose");

// Outcome of a WhatsApp message we attempted to send.
// "sent" means Slide/Meta ACCEPTED the message, NOT that it reached the handset —
// delivery receipts would need webhooks, which we don't consume yet.
//
// Shared by orderModel (order confirmations) and tallyInvoiceModel (invoice
// notifications pushed from TallyPrime) so the two can never drift apart.
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

module.exports = whatsappNotificationSchema;
