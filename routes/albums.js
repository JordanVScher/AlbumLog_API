const express = require('express');
const {
  getAlbums,
  getAlbum,
  addAlbum,
  updateAlbum,
  deleteAlbum,
} = require('../controllers/albums');


const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAlbums)
  .post(addAlbum);

router
  .route('/:id')
  .get(getAlbum)
  .put(updateAlbum)
  .delete(deleteAlbum);

module.exports = router;
