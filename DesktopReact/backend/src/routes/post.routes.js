const express = require('express');
const postController = require('../controllers/posts.controller');

const router = express.Router();

router
    .route('')
    .get(postController.getPosts);

router
    .route('/feed')
    .get(postController.getFeed);

router
    .route('')
    .post(postController.createPost);

router
    .route('/replies')
    .get(postController.getReplies);

module.exports = router;