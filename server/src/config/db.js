const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'vouchers.db');
const db = new Database(dbPath);

// Enable Foreign Keys and WAL mode for better concurrency and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
const schemaPath = path.resolve(__dirname, '../models/schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
}

module.exports = db;
