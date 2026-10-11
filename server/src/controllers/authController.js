const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

exports.login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employee_id,
      department: user.department
    };

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: userPayload
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = (req, res, next) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, employee_id, department, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id,
        department: user.department,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getDemoAccounts = (req, res, next) => {
  try {
    const accounts = db.prepare('SELECT id, name, email, role, department, employee_id FROM users ORDER BY id ASC').all();
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    next(error);
  }
};
