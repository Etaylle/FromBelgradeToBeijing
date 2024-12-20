// middleware/errorHandler.js
  const errorHandler = (err, req, res, next) => {
  console.error(`Error occurred: ${err.message}`);
  console.error(`Stack trace: ${err.stack}`);
  console.error(`Request: ${req.method} ${req.url}`);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
