const express = require('express');
const {
  register,
  userPhotoUpload,
} = require('../controllers/auth');


const router = express.Router({ mergeParams: true });

router
  .route('/register')
  .post(register);

router
  .route('/:id/photo')
  .put(userPhotoUpload);

module.exports = router;
