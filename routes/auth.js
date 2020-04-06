const express = require('express');
const {
  register,
  userPhotoUpload,
} = require('../controllers/auth');

const User = require('../models/User');
const photoUpload = require('../middleware/photoUpload');

const router = express.Router({ mergeParams: true });

router
  .route('/register')
  .post(register);

router
  .route('/:id/photo')
  .put(photoUpload(User), userPhotoUpload);

module.exports = router;
