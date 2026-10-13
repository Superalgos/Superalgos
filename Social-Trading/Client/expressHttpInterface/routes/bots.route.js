const express = require('express');
const botsController = require('../controllers/bots.controller');

const router = express.Router();

// Fetch all Bots
router
    .route('/social-entities')
    .get(botsController.fetchBots);

// Create a new Bot
router
    .route('/createBot')
    .post( botsController.createBot);

// Saves a Bot Profile    
router
    .route('/saveBotProfile')
    .post(botsController.saveBotProfile);

// Loads all Bot Profiles      
router
    .route('/profile')
    .get(botsController.loadProfile);

module.exports = router;
