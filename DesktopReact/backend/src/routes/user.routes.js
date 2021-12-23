const express = require('express');
const userController = require('../controllers/users.controller');

const router = express.Router();

router
  .route('/profiles')
  .get(userController.getProfiles);

router
  .route('/follow')
  .get(userController.follow);

module.exports = router;