const { userService } = require('../services');

const getProfiles = async (req, res) => {
  const result = await userService.getProfiles();
  res.send(result);
};

const follow = async (req, res) => {
  const result = await userService.followProfile(req.body.userProfileId, req.body.eventType);
  res.send(result);
};

const profile = async (req, res) => {
  const result = await userService.profile(req.body.id, req.body.type);
  res.send(result);
};

module.exports = {
  getProfiles,
  follow,
  profile
};




