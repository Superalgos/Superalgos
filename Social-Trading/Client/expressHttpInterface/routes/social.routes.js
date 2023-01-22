const express = require('express');
const socialController = require('../controllers/social.controller');

const router = express.Router();

router
    .route('/all-users')
    .get(socialController.getUsers);

router
    .route('/follow')
    .post(socialController.follow);


module.exports = router;