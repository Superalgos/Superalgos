const express = require('express');
const defaultController = require('../controllers/default.controller');

const router = express.Router();
    
router
    .route('/ClientNode')
    .get(defaultController.clientNode);

router
    .route('/ProjectsSchema')
    .get(defaultController.projectsSchema);

router
    .route('/Projects/*')
    .get(defaultController.projects);

router
    .route('/Environment')
    .get(defaultController.environment);

/* router
    .route('/')
    .get(defaultController.root); */

module.exports = router;