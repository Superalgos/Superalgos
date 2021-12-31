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

const paginateProfiles = async (req, res) => {
  const {initialIndex, pagination} = req.body
  await userService.paginateProfiles(initialIndex, pagination).then( response => {
    res.send(response)
  }).catch(error =>{ res.send(error)})
}

module.exports = {
  getProfiles,
  follow,
  profile,
  paginateProfiles
};




