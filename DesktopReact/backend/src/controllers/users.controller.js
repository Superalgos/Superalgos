const { userService } = require('../services');

const getProfiles = async (req, res) => {
  const result = await userService.getProfiles();
  res.send(result);
};

const follow = async (req, res) => {
  const result = await userService.followProfile(req.body.userProfileId);
  res.send(result);
};

const editProfile = async (req, res) => {
  const result = await userService.editProfile(req.body);
  res.send(result);
};

const getProfile = async (req, res) => {
  const result = await userService.getProfile(req.query.userProfileId,req.query.username);
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
  paginateProfiles,
  editProfile,
  getProfile
};




