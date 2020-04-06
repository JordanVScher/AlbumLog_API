const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Album = require('../models/Album');

// @desc    Get all albums
// @route   GET /api/v1/albums
// @access  public
exports.getAlbums = asyncHandler(async (req, res) => res.status(200).json(res.advancedResults));

// @desc    Get one album
// @route   GET /api/v1/albums/:id
// @access  public
exports.getAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findById(req.params.id);
  if (!album) return next(new ErrorResponse(`Album not found with ${req.params.id}`, 404));
  return res.status(201).json({ success: true, data: album });
});

// @desc    add one album
// @route   POST /api/v1/albums
// @access  private
exports.addAlbum = asyncHandler(async (req, res) => {
  const album = await Album.create(req.body);
  res.status(201).json({ success: true, data: album });
});

// @desc    update one album
// @route   PUT /api/v1/albums/:id
// @access  private
exports.updateAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!album) return next(new ErrorResponse(`Album not found with ${req.params.id}`, 404));

  return res.status(201).json({ success: true, data: album });
});

// @desc    delete one album
// @route   DELETE /api/v1/albums/:id
// @access  private
exports.deleteAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findById(req.params.id);
  if (!album) return next(new ErrorResponse(`Album not found with ${req.params.id}`, 404));

  album.remove();
  return res.status(201).json({ success: true, data: album });
});
