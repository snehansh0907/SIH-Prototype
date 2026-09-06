// =========================================================
// Centralized Error Handler
// =========================================================
// Every API response follows the same shape:
//   success: true  -> { success: true, data: {...} }
//   success: false -> { success: false, message: "..." }
// =========================================================

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server.',
  });
}

// Wraps an async controller function so thrown errors / rejected
// promises are automatically forwarded to errorHandler via next().
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Simple helper to throw an error with a specific HTTP status code.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, asyncHandler, ApiError };
