const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
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
exports.register = asyncHandler(async (req, res) => {
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

// @desc    logout user (cleans token cookie)
// @route   put /api/v1/auth/logout
// @access  private
exports.logout = asyncHandler(async (req, res) => {
  // Cookie expires in 10 minutes
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    get logged user data
// @route   put /api/v1/auth/get
// @access  private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});


// @desc    update user password
// @route   put /api/v1/auth/resetpassword
// @access  private
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed password
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  // Find user with that resetPasswordToken and check if it hasn't expired yet
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next(new ErrorResponse('Invalid token', 404));

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return sendTokenResponse(user, 200, res);
});


// @desc    generate reset password token
// @route   put /api/v1/auth/forgotpassword
// @access  private
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorResponse('Please fill email field', 400));

  // Find user with the requested e-mail
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorResponse('There is no user with that e-mail', 404));

  // Get Reset Token
  const resetToken = await user.getResetPasswordToken();
  // save password expirarion tokens (bypass validation)
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `You are receiving this e-mail because you have requested the reset of a password. Please make a PUT request to: \n\n${resetUrl}`;

  try {
    console.log('message', message);
    await sendEmail({ email, subject: 'Reset Password', message });
    return res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    console.log('error', error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('E-mail could not be sent', 500));
  }
});
