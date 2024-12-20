const User = require('../models/user.model'); // Import the User model

// Populate `req.user` from session data
const populateUser = async (req, res, next) => {
  if (req.session && req.session.user) {
    try {
      const user = await User.findByPk(req.session.user.id, {
        attributes: { exclude: ['password'] },
      });
      if (user) {
        req.user = user; // Attach user to the request object
        return next();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }
  res.status(401).json({ message: "Unauthorized. Please log in to access this resource." });
};

// Simple session authentication middleware
const authenticateSession = (req, res, next) => {
  console.log('Session:', req.session);
  if (req.session && req.session.user) {
    console.log(`Authenticated user: ${req.session.user.username}`);
    return next();
  }
  console.warn(`Unauthorized access attempt: ${req.method} ${req.url}`);
  res.status(401).json({ message: "Unauthorized. Please log in to access this resource." });
};

module.exports = {
  populateUser,
  authenticateSession,
};
