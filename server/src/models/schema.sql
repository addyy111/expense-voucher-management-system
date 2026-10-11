-- Expense Voucher Management System Schema
-- Designed for Prachay Securities Private Limited

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK(role IN ('employee', 'director', 'accounts')),
    employee_id VARCHAR(50),
    department VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number VARCHAR(50) NOT NULL UNIQUE,
    voucher_date DATE NOT NULL,
    expense_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    expense_title VARCHAR(200) NOT NULL,
    expense_category VARCHAR(100) NOT NULL,
    expense_description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK(amount > 0),
    employee_id_code VARCHAR(50),
    employee_name VARCHAR(100) NOT NULL,
    employee_signature TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Pending Approval', 'Approved', 'Rejected')),
    director_signature TEXT,
    approval_date DATETIME,
    rejection_reason TEXT,
    created_by INTEGER NOT NULL,
    approved_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_vouchers_user ON vouchers(created_by);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_dept ON vouchers(department);
CREATE INDEX IF NOT EXISTS idx_vouchers_dates ON vouchers(expense_date, voucher_date);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by INTEGER NOT NULL,
    performed_by_name VARCHAR(100) NOT NULL,
    performed_by_role VARCHAR(20) NOT NULL,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);
