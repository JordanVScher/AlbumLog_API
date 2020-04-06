const mongoose = require('mongoose');
const slugify = require('slugify');

const AlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add title'],
    trim: true,
  },
  cover: {
    type: String,
    default: 'no-photo.jpg',
  },
  description: String,
  tracks: String,
  year: {
    type: Number,
    required: [true, 'Please add release year'],
  },
  artist: {
    type: String,
    required: [true, 'Please add artist'],
  },
  averageRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  slug: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// create bootcamp slug from schema from the name
AlbumSchema.pre('save', function preSlug(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});


module.exports = mongoose.model('Album', AlbumSchema);
