const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../uploads/signatures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1x1 transparent PNG / simple signature placeholder buffer
// A small 200x80 clean SVG or PNG can be written
const samplePngBase64 = 
  'iVBORw0KGgoAAAANSUhEUgAAAMgAAABQAQMAAAB+Gz8CAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAZElEQVRIie3QMQ2AMBgG0fe6BBLggkKkABYy6sYwFDBw6X5N8zfvS3P0S5KEJCSQ0A81hZ72B+jT6aEghRRSCCE+kHIK6YSUQ0glhFwglRAyglRCyApRCFEJr36m91FChAgR4hshLqFmZpY8YyYAAAAASUVORK5CYII=';

const empSigBuffer = Buffer.from(samplePngBase64, 'base64');
fs.writeFileSync(path.join(uploadDir, 'sample-aarav-sig.png'), empSigBuffer);
fs.writeFileSync(path.join(uploadDir, 'sample-pooja-sig.png'), empSigBuffer);
fs.writeFileSync(path.join(uploadDir, 'sample-director-sig.png'), empSigBuffer);

console.log('Sample signature files created in uploads/signatures/');

// Clear existing tables
db.exec(`
  DELETE FROM audit_logs;
  DELETE FROM vouchers;
  DELETE FROM users;
`);

// Reset SQLite auto-increment counters
try {
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'vouchers', 'audit_logs');");
} catch (e) {
  // Ignore if sqlite_sequence not initialized
}

console.log('Reset existing database tables.');

// 1. Create Users
const passwordHash = bcrypt.hashSync('employee123', 10);
const directorHash = bcrypt.hashSync('director123', 10);
const accountsHash = bcrypt.hashSync('accounts123', 10);

const insertUser = db.prepare(`
  INSERT INTO users (name, email, password, role, employee_id, department)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const directorUser = insertUser.run('Vikram Malhotra', 'director@prachay.com', directorHash, 'director', 'DIR-001', 'Executive Management');
const empAarav = insertUser.run('Aarav Sharma', 'employee@prachay.com', passwordHash, 'employee', 'EMP-1042', 'Equity Research');
const empPooja = insertUser.run('Pooja Patel', 'pooja@prachay.com', passwordHash, 'employee', 'EMP-1088', 'Technology');
const accountsUser = insertUser.run('Sunita Rao', 'accounts@prachay.com', accountsHash, 'accounts', 'ACC-004', 'Finance & Accounts');

console.log('Seeded users: Director, 2 Employees, Accounts.');

// 2. Create Sample Vouchers
const insertVoucher = db.prepare(`
  INSERT INTO vouchers (
    voucher_number, voucher_date, expense_date, department,
    expense_title, expense_category, expense_description, amount,
    employee_id_code, employee_name, employee_signature,
    status, director_signature, approval_date, rejection_reason,
    created_by, approved_by, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAudit = db.prepare(`
  INSERT INTO audit_logs (voucher_id, action, performed_by, performed_by_name, performed_by_role, remarks, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// Voucher 1: Draft by Aarav Sharma
const v1 = insertVoucher.run(
  'VCH-2026-0001',
  '2026-10-10',
  '2026-10-08',
  'Equity Research',
  'Bloomberg Terminal Quarterly Subscription Add-on',
  'Software & Tools',
  'Supplementary dataset access for Indian mid-cap equity valuation research.',
  18500.00,
  'EMP-1042',
  'Aarav Sharma',
  null, // Draft doesn't require signature yet
  'Draft',
  null,
  null,
  null,
  empAarav.lastInsertRowid,
  null,
  '2026-10-10 10:30:00',
  '2026-10-10 10:30:00'
);

insertAudit.run(v1.lastInsertRowid, 'CREATED_DRAFT', empAarav.lastInsertRowid, 'Aarav Sharma', 'employee', 'Saved as initial draft', '2026-10-10 10:30:00');

// Voucher 2: Pending Approval by Aarav Sharma
const v2 = insertVoucher.run(
  'VCH-2026-0002',
  '2026-10-09',
  '2026-10-07',
  'Equity Research',
  'Client Networking Dinner with Institutional Investors',
  'Client Entertainment',
  'Dinner meeting at ITC Grand Central with fund managers discussing Q3 market outlook.',
  12450.00,
  'EMP-1042',
  'Aarav Sharma',
  '/uploads/signatures/sample-aarav-sig.png',
  'Pending Approval',
  null,
  null,
  null,
  empAarav.lastInsertRowid,
  null,
  '2026-10-09 14:15:00',
  '2026-10-09 14:20:00'
);

insertAudit.run(v2.lastInsertRowid, 'CREATED_DRAFT', empAarav.lastInsertRowid, 'Aarav Sharma', 'employee', 'Draft created', '2026-10-09 14:15:00');
insertAudit.run(v2.lastInsertRowid, 'SUBMITTED_FOR_APPROVAL', empAarav.lastInsertRowid, 'Aarav Sharma', 'employee', 'Submitted with signature for Director approval', '2026-10-09 14:20:00');

// Voucher 3: Approved by Director (Aarav Sharma)
const v3 = insertVoucher.run(
  'VCH-2026-0003',
  '2026-10-05',
  '2026-10-03',
  'Equity Research',
  'CFA Institute Annual Research Conference Tickets',
  'Training & Certifications',
  'Attendance registration for national equity analysis and securities compliance summit in Mumbai.',
  24000.00,
  'EMP-1042',
  'Aarav Sharma',
  '/uploads/signatures/sample-aarav-sig.png',
  'Approved',
  '/uploads/signatures/sample-director-sig.png',
  '2026-10-06 11:45:00',
  null,
  empAarav.lastInsertRowid,
  directorUser.lastInsertRowid,
  '2026-10-05 09:00:00',
  '2026-10-06 11:45:00'
);

insertAudit.run(v3.lastInsertRowid, 'CREATED_DRAFT', empAarav.lastInsertRowid, 'Aarav Sharma', 'employee', 'Created draft', '2026-10-05 09:00:00');
insertAudit.run(v3.lastInsertRowid, 'SUBMITTED_FOR_APPROVAL', empAarav.lastInsertRowid, 'Aarav Sharma', 'employee', 'Submitted for review', '2026-10-05 09:15:00');
insertAudit.run(v3.lastInsertRowid, 'APPROVED', directorUser.lastInsertRowid, 'Vikram Malhotra', 'director', 'Approved. Valid professional development expense.', '2026-10-06 11:45:00');

// Voucher 4: Rejected by Director (Aarav Sharma)
const v4 = insertVoucher.run(
  'VCH-2026-0004',
  '2026-10-02',
  '2026-09-28',
  'Equity Research',
  'Personal Smartphone Upgrade Claim',
  'Other',
  'Purchased phone upgrade citing mobile trading monitoring.',
  35000.00,
  'EMP-1042',
  'Aarav Sharma',
  '/uploads/signatures/sample-aarav-sig.png',
  'Rejected',
  null,
  '2026-10-03 16:30:00',
  'Personal electronic device purchases are not eligible under policy without prior IT department procurement pre-approval.',
  empAarav.lastInsertRowid,
  directorUser.lastInsertRowid,
  '2026-10-02 11:00:00',
  '2026-10-03 16:30:00'
);

insertAudit.run(v4.lastInsertRowid, 'CREATED_DRAFT', empAarav.lastInsertRowid, 'Aarav Sharma', 'employee', 'Draft created', '2026-10-02 11:00:00');
insertAudit.run(v4.lastInsertRowid, 'SUBMITTED_FOR_APPROVAL', empAarav.lastInsertRowid, 'Aarav Sharma', 'employee', 'Submitted for approval', '2026-10-02 11:30:00');
insertAudit.run(v4.lastInsertRowid, 'REJECTED', directorUser.lastInsertRowid, 'Vikram Malhotra', 'director', 'Rejected: Personal electronic device purchases not eligible without prior IT pre-approval.', '2026-10-03 16:30:00');

// Voucher 5: Pending Approval by Pooja Patel (Technology Dept)
const v5 = insertVoucher.run(
  'VCH-2026-0005',
  '2026-10-11',
  '2026-10-09',
  'Technology',
  'AWS Cloud Infrastructure Overage for Trading Gateway',
  'Software & Tools',
  'High volume order execution latency test environment server charges during Q3 load testing.',
  42800.00,
  'EMP-1088',
  'Pooja Patel',
  '/uploads/signatures/sample-pooja-sig.png',
  'Pending Approval',
  null,
  null,
  null,
  empPooja.lastInsertRowid,
  null,
  '2026-10-11 09:30:00',
  '2026-10-11 09:35:00'
);

insertAudit.run(v5.lastInsertRowid, 'CREATED_DRAFT', empPooja.lastInsertRowid, 'Pooja Patel', 'employee', 'Draft created', '2026-10-11 09:30:00');
insertAudit.run(v5.lastInsertRowid, 'SUBMITTED_FOR_APPROVAL', empPooja.lastInsertRowid, 'Pooja Patel', 'employee', 'Submitted for Director review with invoice attachment', '2026-10-11 09:35:00');

// Voucher 6: Approved by Director (Pooja Patel)
const v6 = insertVoucher.run(
  'VCH-2026-0006',
  '2026-10-04',
  '2026-10-01',
  'Technology',
  'High-Speed Lease Line Diagnostic Hardware',
  'Office Supplies',
  'Network switch transceivers for low latency exchange feed gateway.',
  16200.00,
  'EMP-1088',
  'Pooja Patel',
  '/uploads/signatures/sample-pooja-sig.png',
  'Approved',
  '/uploads/signatures/sample-director-sig.png',
  '2026-10-05 15:20:00',
  null,
  empPooja.lastInsertRowid,
  directorUser.lastInsertRowid,
  '2026-10-04 10:00:00',
  '2026-10-05 15:20:00'
);

insertAudit.run(v6.lastInsertRowid, 'CREATED_DRAFT', empPooja.lastInsertRowid, 'Pooja Patel', 'employee', 'Draft created', '2026-10-04 10:00:00');
insertAudit.run(v6.lastInsertRowid, 'SUBMITTED_FOR_APPROVAL', empPooja.lastInsertRowid, 'Pooja Patel', 'employee', 'Submitted for review', '2026-10-04 10:15:00');
insertAudit.run(v6.lastInsertRowid, 'APPROVED', directorUser.lastInsertRowid, 'Vikram Malhotra', 'director', 'Approved for production network upgrade.', '2026-10-05 15:20:00');

console.log('Seeded 6 sample vouchers spanning Draft, Pending Approval, Approved, and Rejected states.');
console.log('Database seeding complete successfully!');
