// api/middleware/authenticateSession.js
const authenticateSession = (req, res, next) => {
    if (req.session && req.session.user) {
      next(); // User is authenticated, continue to the next middleware/controller
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
  
  module.exports = authenticateSession;
  