const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Register one new user
// @route   post /api/v1/auth/register
// @access  private
exports.register = asyncHandler(async (req, res) => {
  const {
    name, email, password, role,
  } = req.body;

  const user = await User.create({
    name, email, password, role,
  });

  // generate jwt
  const token = await user.getSignedJwtToken();


  res.status(200).json({ success: true, token });
});
