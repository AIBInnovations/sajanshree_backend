const test = require('node:test');
const assert = require('node:assert');
const { normalizeToWhatsAppNumber } = require('../utils/phone');

test('normalizes Indian numbers in every format admins type', () => {
  const expected = '919876543210';
  for (const input of [
    '9876543210',
    '98765 43210',
    '98765-43210',
    '+91 98765 43210',
    '+919876543210',
    '(+91) 98765 43210',
    '091 98765 43210',
    '09876543210',
    '00919876543210',
    '  9876543210  ',
    919876543210, // a number, not a string
  ]) {
    const result = normalizeToWhatsAppNumber(input);
    assert.deepStrictEqual(result, { ok: true, value: expected }, `failed for: ${input}`);
  }
});

test('rejects landlines, which cannot receive WhatsApp', () => {
  assert.deepStrictEqual(normalizeToWhatsAppNumber('022-2345 6789'), { ok: false, reason: 'NOT_A_MOBILE' });
  assert.deepStrictEqual(normalizeToWhatsAppNumber('912223456789'), { ok: false, reason: 'NOT_A_MOBILE' });
});

test('rejects empty input without throwing', () => {
  for (const input of [null, undefined, '', '   ', 'abc', '+']) {
    assert.deepStrictEqual(normalizeToWhatsAppNumber(input), { ok: false, reason: 'EMPTY' }, `failed for: ${input}`);
  }
});

test('rejects numbers that are too short or too long', () => {
  assert.deepStrictEqual(normalizeToWhatsAppNumber('12345'), { ok: false, reason: 'TOO_SHORT' });
  assert.deepStrictEqual(normalizeToWhatsAppNumber('1234567890123456'), { ok: false, reason: 'TOO_LONG' });
});

test('passes through numbers that already carry a foreign country code', () => {
  assert.deepStrictEqual(normalizeToWhatsAppNumber('+1 415 555 0123'), { ok: true, value: '14155550123' });
  assert.deepStrictEqual(normalizeToWhatsAppNumber('+971 50 123 4567'), { ok: true, value: '971501234567' });
});

test('honours an explicit default country code', () => {
  assert.deepStrictEqual(normalizeToWhatsAppNumber('9876543210', '971'), { ok: true, value: '9719876543210' });
});

test('honours WHATSAPP_DEFAULT_COUNTRY_CODE from the environment', () => {
  const previous = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE;
  process.env.WHATSAPP_DEFAULT_COUNTRY_CODE = '44';
  try {
    assert.deepStrictEqual(normalizeToWhatsAppNumber('7876543210'), { ok: true, value: '447876543210' });
  } finally {
    if (previous === undefined) delete process.env.WHATSAPP_DEFAULT_COUNTRY_CODE;
    else process.env.WHATSAPP_DEFAULT_COUNTRY_CODE = previous;
  }
});
