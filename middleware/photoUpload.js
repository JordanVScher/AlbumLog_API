const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

const { MAX_FILE_SIZE } = process.env;
const { FILE_UPLOAD_PATH } = process.env;

const photoUpload = (model) => async (req, res, next) => {
  const found = await model.findById(req.params.id);

  if (!found) return next(new ErrorResponse(`User not found with ${req.params.id}`, 404));

  if (!req.files) return next(new ErrorResponse('Please upload a file', 404));
  const { file } = req.files;

  // check if image is photo
  if (!file.mimetype.startsWith('image')) return next(new ErrorResponse('Please upload an image file', 404));

  // check file size
  if (file.size > MAX_FILE_SIZE) return next(new ErrorResponse(`Please upload an image less then ${MAX_FILE_SIZE} in size`, 404));

  // create custom filename
  file.name = `photo_${found._id}${path.parse(file.name).ext}`;

  file.mv(`${FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) return next(new ErrorResponse('There was an error saving the file', 500));

    await model.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.photoUpload = { success: true, data: file.name };
    return next();
  });
  return true;
};

module.exports = photoUpload;
