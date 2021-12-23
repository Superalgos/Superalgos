const { userService } = require('../services');

const getProfiles = async (req, res) => {
  const result = await userService.getProfiles();
  res.send(result);
};

const follow = async (req, res) => {
  const result = await userService.whoTofollow();
  res.send(result);
};

const unfollow = async (req, res) => {
  const result = await userService.followProfile(req.body.userId, req.body.eventType);
  res.send(result);
};


module.exports = {
  getProfiles,
  follow,
  unfollow
};




