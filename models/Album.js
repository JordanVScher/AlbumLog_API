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
    max: 10,
  },
  slug: String,
}, { timestamps: true });

AlbumSchema.virtual('summary').get(function () {
  return `${this.title} - ${this.artist} (${this.year})`;
});

// create bootcamp slug from schema from the name
AlbumSchema.pre('save', function preSlug(next) {
  const slug = `${this.title} ${this.artist} ${this.year}`;
  this.slug = slugify(slug, { lower: true });
  next();
});


module.exports = mongoose.model('Album', AlbumSchema);
