const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Album = require('../models/Album');

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @access  public
exports.getReviews = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.params.albumId) filter.album = req.params.albumId; // /albums/:albumId/reviews
  if (req.params.userId) filter.user = req.params.userId; // /users/:userId/reviews

  if (filter.album || filter.user) {
    const reviews = await Review.find(filter);

    return res.status(200).json({ success: true, count: reviews.length, data: reviews });
  }

  return res.status(200).json(res.advancedResults);
});


// @desc    Get one review
// @route   GET /api/v1/reviews/:id
// @access  public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'album',
    select: 'title artist year',
  }).populate({
    path: 'user',
    select: 'name email',
  });

  if (!review) return next(new ErrorResponse(`Review not found with ID ${req.params.id}`, 404));

  return res.status(201).json({ success: true, data: review });
});

// @desc    Create one review
// @route   POST /api/v1/reviews
// @access  private
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const data = { ...req.body };
  const { albumId } = req.params;
  data.album = albumId;

  const album = await Album.findById(albumId);
  if (!album) return next(new ErrorResponse(`Album not found with ID ${albumId}`, 404));

  const review = await Review.create(data);
  return res.status(201).json({ success: true, data: review });
});

// @desc    Update one review
// @route   PUT /api/v1/reviews/:id
// @access  private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorResponse(`Review not found with ${req.params.id}`, 404));

  // Make sure user is the owner of the review
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User is not authorized to update Review ${review._id}`, 401));
  }

  Object.keys(req.body).forEach((key) => {
    review[key] = req.body[key];
  });

  review.save();
  return res.status(201).json({ success: true, data: review });
});

// @desc    Delete one review
// @route   DELETE /api/v1/reviews/:id
// @access  private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorResponse(`Review not found with ${req.params.id}`, 404));

  // Make sure user is the owner of the review
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User is not authorized to delete Review ${review._id}`, 401));
  }

  review = await Review.findById(req.params.id);
  review.remove();

  return res.status(201).json({ success: true, data: review });
});
