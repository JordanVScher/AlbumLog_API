const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

const { JWT_SECRET } = process.env;
const notAuthorizedMsg = 'Not authorized to access this route';

// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  const authorization = req.headers && req.headers.authorization ? req.headers.authorization : null;
  if (authorization && authorization.startsWith('Bearer')) {
    // Set Token from header
    token = authorization.split(' ')[1]; // eslint-disable-line prefer-destructuring
  } else if (req.cookies.token) {
    // Set Token from cookie
    token = req.cookies.token;
  }

  if (!token) return next(new ErrorResponse(notAuthorizedMsg, 401));

  try {
    // Verify Token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);

    return next();
  } catch (error) {
    return next(new ErrorResponse(notAuthorizedMsg, 401));
  }
});


// Grant access to specific roles
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new ErrorResponse(`User role "${req.user.role}" is not authorized to access this route`, 403));
  return next();
};
