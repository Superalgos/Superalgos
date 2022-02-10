const express = require('express');
const postController = require('../controllers/posts.controller');

const router = express.Router();

router
    .route('')
    .post(postController.createPost);

router
    .route('')
    .get(postController.getPosts);

router
    .route('/post')
    .get(postController.getPost);

router
    .route('/feed')
    .get(postController.getFeed);

router
    .route('/reactions')
    .post(postController.postReactions)

router
    .route('/replies')
    .get(postController.getReplies);

router
    .route('/replies')
    .post(postController.createReply);

module.exports = router;