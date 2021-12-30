const express = require('express');
const userController = require('../controllers/users.controller');

const router = express.Router();

router
  .route('/profiles')
  .get(userController.getProfiles);

router
  .route('/follow')
  .post(userController.follow);

  router
  .route('/profile')
  .get(userController.getProfile);

router
  .route('/profile')
  .post(userController.editProfile);

module.exports = router;