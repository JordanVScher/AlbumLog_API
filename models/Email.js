const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  subject: String,
  content: String,
  messageID: String,
  error: String,
  from: String,
  sentTo: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Email', EmailSchema);
