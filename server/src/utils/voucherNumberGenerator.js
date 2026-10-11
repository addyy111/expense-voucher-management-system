const db = require('../config/db');

function generateVoucherNumber() {
  const currentYear = new Date().getFullYear();
  const prefix = `VCH-${currentYear}-`;

  // Find the highest sequence number for this year
  const lastVoucher = db
    .prepare("SELECT voucher_number FROM vouchers WHERE voucher_number LIKE ? ORDER BY id DESC LIMIT 1")
    .get(`${prefix}%`);

  let nextSequence = 1;
  if (lastVoucher && lastVoucher.voucher_number) {
    const parts = lastVoucher.voucher_number.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }
  }

  // Pad to 4 digits: e.g. VCH-2026-0001
  const padded = String(nextSequence).padStart(4, '0');
  return `${prefix}${padded}`;
}

module.exports = {
  generateVoucherNumber
};
