const express = require('express');
const {
  register,
  userPhotoUpload,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
} = require('../controllers/auth');

const User = require('../models/User');
const photoUpload = require('../middleware/photoUpload');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(protect, logout);
router.route('/me').get(protect, getMe);
router.route('/:id/photo').put(protect, photoUpload(User), userPhotoUpload);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);
router.route('/updatedetails').put(protect, updateDetails);
router.route('/updatepassword').put(protect, updatePassword);

module.exports = router;
