const express = require('express');
const postController = require('../controllers/posts.controller');

const router = express.Router();

router
  .route('')
  .get(postController.getPosts);

router
  .route('')
  .post(postController.createPost);

module.exports = router;