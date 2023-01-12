const {socialService} = require('../services');

const getUsers = async (req, res) => {
    console.table(req.query)
    console.table(req.body)
    console.table(req.params)
    const result = await socialService.getAllUsers(req.query)
    res.send(result)
}


const follow = async (req, res) => {
    const result = await socialService.followProfile(req.body.userProfileId);
    res.send(result);
};



module.exports = {
    getUsers,
    follow
};