const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWTSecret = process.env.JWT_SECRET;
const JWTExpire = process.env.JWT_EXPIRE;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add name'],
    trim: true,
    maxlength: [75, 'Name can not be more than 75 chars'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please add email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // eslint-disable-line max-len
      'Please add valid mail',
    ],
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please add password'],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// encrypt password using bcrypt
UserSchema.pre('save', async function(next) { // eslint-disable-line
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// sign JWT
UserSchema.methods.getSignedJwtToken = function () { // eslint-disable-line
  return jwt.sign({ id: this._id }, JWTSecret, { expiresIn: JWTExpire });
};


module.exports = mongoose.model('User', UserSchema);
