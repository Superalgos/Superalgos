const express = require('express');
const userController = require('../controllers/users.controller');

const router = express.Router();

router
    .route('/social-persona')
    .get(userController.getSocialPersonaId);

router
    .route('/follow')
    .post(userController.follow);

router
    .route('/profile')
    .get(userController.loadProfile);

router
    .route('/profile')
    .post(userController.saveProfile);

router
    .route('/paginate-profiles')
    .post(userController.paginateProfiles)

router
    .route('/create-profile')
    .post(userController.createProfile)

router
    .route('/social-entities')
    .get(userController.listSocialEntities)

router
    .route('/social-entities')
    .post(userController.createSocialPersona)

module.exports = router;