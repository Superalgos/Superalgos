const {socialService} = require('../services');

const getUsers = async (req, res) => {
    const result = await socialService.getAllUsers(req.query)
    res.send(result)
}


const follow = async (req, res) => {
    const result = await socialService.followOrUnfollowProfile(req.body);
    res.send(result);
};




module.exports = {
    getUsers,
    follow
};