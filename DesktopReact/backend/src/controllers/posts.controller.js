const { postService } = require('../services');

const getPosts = async (req, res) => {
  const result = await postService.getPosts();
  res.send(result);
};

const createPost = async (req, res) => {
  const result = await postService.createPost(req);
  res.send(result);
};


module.exports = {
    getPosts,
    createPost
};

