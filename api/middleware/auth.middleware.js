// middleware/auth.middleware.js
const User = require('../models/user.model');
const crypto = require('crypto');
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
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const validateWebhookSignature = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  next();
};
module.exports = {
  authenticateSession,
  validateRegisterInput,
  validateLoginInput,
  validateWebhookSignature
};