const crypto = require("crypto");

// Auth for the TallyPrime companion service.
//
// Deliberately NOT the JWT `protect` middleware. That one is built for a browser
// session: a token with an expiry, minted by a human logging in. The companion
// runs unattended on a shop PC with nobody there to re-authenticate it, so it
// carries a long-lived shared key instead.
//
// Consequences worth being honest about:
//   - This key is a machine credential sitting on a till PC. Treat it as
//     compromised the day that PC is. It must be rotatable without a code change
//     (it is: one env var), and it grants ONLY invoice notification, nothing else.
//   - It is not a user. Routes behind it get no req.user, and must never be
//     mounted alongside routes that assume one.

// Compare via fixed-length digests: timingSafeEqual throws on length mismatch,
// and the lengths themselves would leak the key length to a prober.
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function tallyAuth(req, res, next) {
  const expected = process.env.TALLY_API_KEY;

  // Fail closed. An unset key must never mean "let everyone in" — that would turn
  // a missing line in .env into an open relay for paid WhatsApp messages.
  if (!expected) {
    console.error("⚠️ Tally endpoint called but TALLY_API_KEY is not set — refusing.");
    return res.status(503).json({ message: "Tally integration is not configured" });
  }

  const presented = req.get("x-api-key") || "";
  if (!presented || !safeEqual(presented, expected)) {
    console.warn(`🔒 Rejected Tally request from ${req.ip}: bad or missing X-Api-Key`);
    return res.status(401).json({ message: "Invalid API key" });
  }

  return next();
}

module.exports = tallyAuth;
