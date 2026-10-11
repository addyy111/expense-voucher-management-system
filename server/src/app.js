const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const voucherRoutes = require('./routes/voucher.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Cross-Origin Resource Sharing
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsers with support for base64 image data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads (signatures)
const uploadDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Expense Voucher Management System API'
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
