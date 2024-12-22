// middleware/error.middleware.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map(e => e.message)
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'This email or username is already in use'
    });
  }

  res.status(500).json({
    message: 'Internal server error'
  });
};

module.exports = errorHandler;