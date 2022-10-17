const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10'],
  },
  album: {
    type: mongoose.Schema.ObjectId,
    ref: 'Album',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Prevent user from submitting more than one review per album
ReviewSchema.index({ album: 1, user: 1 }, { unique: true });

// Static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function (albumId) {
  const obj = await this.aggregate([
    {
      $match: { album: albumId },
    },
    {
      $group: { _id: '$album', averageRating: { $avg: '$rating' } },
    },
  ]);

  try {
    const newRating = obj && obj[0] && obj[0].averageRating ? obj[0].averageRating : 0;
    await this.model('Album').findByIdAndUpdate(albumId, { averageRating: newRating });
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post('save', async function () {
  this.constructor.getAverageRating(this.album);
});

ReviewSchema.post('remove', async function () {
  this.constructor.getAverageRating(this.album);
});


module.exports = mongoose.model('Review', ReviewSchema);
