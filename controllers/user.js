const bcrypt = require('bcryptjs');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

exports.getUsers = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse(`User not found with ${req.params.id}`, 404));

  return res.status(201).json({ success: true, data: user });
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  return res.status(201).json({ success: true, data: user });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse(`User not found with ${req.params.id}`, 404));

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  user = await User.findByIdAndUpdate(user.id, req.body, { new: true, runValidators: true });

  return res.status(201).json({ success: true, data: user });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse(`User not found with ${req.params.id}`, 404));

  user.remove();
  return res.status(201).json({ success: true, data: user });
});
