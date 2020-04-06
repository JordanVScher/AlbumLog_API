const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

const { MAX_FILE_SIZE } = process.env;
const { FILE_UPLOAD_PATH } = process.env;

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

// @desc    add profile picture to user
// @route   put /api/v1/auth/:id/photo
// @access  private
exports.userPhotoUpload = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorResponse(`User not found with ${req.params.id}`, 404));

  if (!req.files) return next(new ErrorResponse('Please upload a file', 404));
  const { file } = req.files;

  // check if image is photo
  if (!file.mimetype.startsWith('image')) return next(new ErrorResponse('Please upload an image file', 404));

  // check file size
  if (file.size > MAX_FILE_SIZE) return next(new ErrorResponse(`Please upload an image less then ${MAX_FILE_SIZE} in size`, 404));

  // create custom filename
  file.name = `photo_${user._id}${path.parse(file.name).ext}`;

  file.mv(`${FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) return next(new ErrorResponse('There was an error saving the file', 500));

    await User.findByIdAndUpdate(req.params.id, { photo: file.name });
    return res.status(201).json({ success: true, data: file.name });
  });
  return true;
});
