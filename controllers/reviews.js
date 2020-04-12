const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Album = require('../models/Album');

exports.getReviews = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.params.albumId) filter.album = req.params.albumId;
  if (req.params.userId) filter.user = req.params.userId;

  if (filter.album || filter.user) {
    const reviews = await Review.find(filter);

    return res.status(200).json({ success: true, count: reviews.length, data: reviews });
  }

  return res.status(200).json(res.advancedResults);
});


exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'album',
    select: 'title artist year',
  });

  if (!review) return next(new ErrorResponse(`Review not found with ID ${req.params.id}`, 404));

  return res.status(201).json({ success: true, data: review });
});


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


exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorResponse(`Review not found with ${req.params.id}`, 404));

  // Make sure user is the owner of the review
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User is not authorized to update Review ${review._id}`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  return res.status(201).json({ success: true, data: review });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorResponse(`Review not found with ${req.params.id}`, 404));

  // Make sure user is the owner of the review
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User is not authorized to delete Review ${review._id}`, 401));
  }

  review = await Review.findByIdAndDelete(req.params.id);

  return res.status(201).json({ success: true, data: review });
});
