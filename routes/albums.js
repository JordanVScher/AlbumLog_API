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

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(advancedResults(Album), getAlbums)
  .post(addAlbum);

router
  .route('/:id')
  .get(getAlbum)
  .put(updateAlbum)
  .delete(deleteAlbum);

module.exports = router;
