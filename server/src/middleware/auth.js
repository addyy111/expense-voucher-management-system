const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'prachay_expense_voucher_jwt_secret_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Fetch fresh user record
    const user = db.prepare('SELECT id, name, email, role, employee_id, department FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRoles,
  JWT_SECRET
};
