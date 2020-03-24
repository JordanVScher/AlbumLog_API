const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Album = require('../models/Album');

// @desc    Get all albums
// @route   GET /api/v1/albums
// @access  public
exports.getAlbums = asyncHandler(async (req, res) => {
  let query;
  const reqQuery = { ...req.query };

  // filter out fields that are used for manipulating query results
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // format operators
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // save the query
  query = Album.find(JSON.parse(queryStr));

  // select desired fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // sort, default is createdAt DESC
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Album.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // run query
  const albums = await query;

  const pagination = {};
  // pagination result
  if (endIndex < total) pagination.next = { page: page + 1, limit };
  if (startIndex > 0) pagination.prev = { page: page - 1, limit };


  return res.status(200).json({
    success: true, count: albums.length, pagination, data: albums,
  });
});

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
