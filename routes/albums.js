const express = require('express');
const {
  getAlbums,
  getAlbum,
  addAlbum,
  updateAlbum,
  deleteAlbum,
} = require('../controllers/albums');

const Album = require('../models/Album');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const reviewRouter = require('./reviews');

const router = express.Router({ mergeParams: true });

router.use('/:albumId/reviews', reviewRouter);

router
  .route('/')
  .get(advancedResults(Album), getAlbums)
  .post(protect, authorize('publisher', 'admin'), addAlbum);

router
  .route('/:id')
  .get(getAlbum)
  .put(protect, authorize('publisher', 'admin'), updateAlbum)
  .delete(protect, authorize('publisher', 'admin'), deleteAlbum);

module.exports = router;
