const {socialService} = require('../services');

const getUsers = async (req, res) => {
    console.table(req.query)
    const result = await socialService.getAllUsers(req.query)
    res.send(result)
}


const follow = async (req, res) => {
    console.table(req.body)
    const result = await socialService.followProfile(req.body);
    res.send(result);
};


const followersAndFollowing = async (req, res) => {
    const result = await socialService.getProfileFollowersAndFollowing(req.query);
    res.send(result);
}



module.exports = {
    getUsers,
    follow,
    followersAndFollowing
};