// middleware/auth.middleware.js
const User = require('../models/user.model');

const authenticateSession = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Please login to continue" });
    }
    next();
  } catch (error) {
    next(error);
  }
};

const validateRegisterInput = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ 
      message: 'Username, email, and password are required.' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters long.' 
    });
  }

  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required.' 
    });
  }

  next();
};

module.exports = {
  authenticateSession,
  validateRegisterInput,
  validateLoginInput
};