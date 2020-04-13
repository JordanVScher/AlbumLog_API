const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 404);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((x) => x.message);
    error = new ErrorResponse(message, 404);
  }

  res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Server Error' });
};

module.exports = errorHandler;
