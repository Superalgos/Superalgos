const botsService = require('../services/bot.service');

const fetchBots = async (req, res) => {
    try {
        const bots = await botsService.fetchBots();
        res.status(200).json(bots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createBot = async (req, res) => {
    const result = await botsService.createBot(req.body);
    res.send(result);
    
};

const saveBotProfile = async (req, res) => {
    try {
        const bot = await botsService.saveProfile(req.body);
        res.status(201).json(bot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loadProfile = async (req, res) => {
    try {
        console.log('LoadBotProfile', req.query)
        const bot = await botsService.loadProfile(req.query);
        res.status(201).json(bot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBot = async (req, res) => {
    try {
        await botsService.deleteBot(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const response = await botsService.sendMessage(req.params.id, req.body.message);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const receiveMessage = async (req, res) => {
    try {
        const message = await botsService.receiveMessage(req.params.id);
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    fetchBots,
    createBot,
    deleteBot,
    saveBotProfile,
    sendMessage,
    receiveMessage,
    loadProfile
};
