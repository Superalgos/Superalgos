const { postService } = require('../services');

const getPosts = async (req, res) => {
  const result = await postService.getPosts(req.query.userId);
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


module.exports = {
    getPosts,
    createPost
};

