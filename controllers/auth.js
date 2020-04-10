const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const expiresIn = process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000;
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + expiresIn),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') options.secure = true;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};


// @desc    Register one new user
// @route   post /api/v1/auth/register
// @access  private
exports.register = asyncHandler(async (req, res, next) => {
  const {
    name, email, password, role,
  } = req.body;

  const user = await User.create({
    name, email, password, role,
  });


  sendTokenResponse(user, 200, res);
});

// @desc    add profile picture to user
// @route   put /api/v1/auth/:id/photo
// @access  private
exports.userPhotoUpload = asyncHandler(async (req, res) => res.status(201).json(res.photoUpload));

// @desc    user login
// @route   put /api/v1/auth/login
// @access  public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // validate email & password
  if (!email || !password) return next(new ErrorResponse('Please provide email and password', 400));

  // check for User
  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new ErrorResponse('Invalid credentials', 401));

  // check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));

  return sendTokenResponse(user, 201, res);
});

// @desc    get logged user data
// @route   put /api/v1/auth/get
// @access  private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});
