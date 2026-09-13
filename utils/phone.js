// Phone normalization for WhatsApp sends.
//
// Slide's /whatsapp/send-template endpoint wants E.164 WITHOUT the leading "+"
// (e.g. 919876543210). Admins type numbers every which way, so normalize here
// rather than at each call site. Pure and never throws — callers treat a bad
// number as "skip the message", never as an error that blocks the order.

const FALLBACK_COUNTRY_CODE = '91';

/**
 * @returns {{ok: true, value: string} | {ok: false, reason: 'EMPTY'|'TOO_SHORT'|'TOO_LONG'|'NOT_A_MOBILE'}}
 */
function normalizeToWhatsAppNumber(raw, defaultCountryCode) {
  const cc =
    String(defaultCountryCode || process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || FALLBACK_COUNTRY_CODE)
      .replace(/\D/g, '') || FALLBACK_COUNTRY_CODE;

  if (raw === null || raw === undefined) return { ok: false, reason: 'EMPTY' };
  const trimmed = String(raw).trim();
  if (!trimmed) return { ok: false, reason: 'EMPTY' };

  // Drop "+", spaces, hyphens, parens, dots. Intent is re-derived from length below.
  let digits = trimmed.replace(/\D/g, '');
  // Strips both the "00" IDD prefix and the Indian trunk "0" in one rule.
  digits = digits.replace(/^0+/, '');
  if (!digits) return { ok: false, reason: 'EMPTY' };

  // Bare local mobile number.
  if (digits.length === 10) {
    // Indian mobile series is 6-9; a 10-digit number starting 2-5 is a landline,
    // which can never receive WhatsApp.
    if (/^[6-9]/.test(digits)) return { ok: true, value: cc + digits };
    return { ok: false, reason: 'NOT_A_MOBILE' };
  }

  // Indian number that already carries its country code.
  if (digits.length === 12 && digits.startsWith('91')) {
    if (/^[6-9]/.test(digits.slice(2))) return { ok: true, value: digits };
    return { ok: false, reason: 'NOT_A_MOBILE' };
  }

  // Some other country's number, already prefixed. E.164 allows up to 15 digits.
  if (digits.length >= 11 && digits.length <= 15) return { ok: true, value: digits };

  return { ok: false, reason: digits.length < 10 ? 'TOO_SHORT' : 'TOO_LONG' };
}

module.exports = { normalizeToWhatsAppNumber };
