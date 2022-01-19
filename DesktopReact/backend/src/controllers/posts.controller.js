const {postService} = require('../services');

const getPosts = async (req, res) => {
    const result = await postService.getPosts(req.query.postHash);
    res.send(result);
};

const getFeed = async (req, res) => {
    const result = await postService.getFeed(req);
    res.send(result);
};

const createPost = async (req, res) => {
    try {
        const result = await postService.createPost(req.body);
        res.send(result);
    } catch (error) {
        console.log(error);
    }
};

const createReply = async (req, res) => {
    try {
        const result = await postService.createReply(req.body);
        res.send(result);
    } catch (error) {
        console.log(error);
    }
};

const getReplies = async (req, res) => {
    try {
        const result = await postService.getReplies(req.query);
        res.send(result);
    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    getPosts,
    createPost,
    getFeed,
    getReplies,
    createReply
};