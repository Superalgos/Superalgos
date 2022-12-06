const {userService} = require('../services');

const follow = async (req, res) => {
    const result = await userService.followProfile(req.body.userProfileId);
    res.send(result);
};

const paginateProfiles = async (req, res) => {
    const {initialIndex, pagination} = req.body
    await userService.paginateProfiles(initialIndex, pagination).then(response => {
        res.send(response)
    }).catch(error => {
        res.send(error)
    })
}

const loadProfile = async (req, res) => {
    const result = await userService.loadProfile(req.query.socialPersonaId);
    res.send(result);
};

const loadProfileData = async (req, res) => {
    const result = await userService.loadProfileData(req.query.socialPersonaId);
    res.send(result);
};


const saveProfile = async (req, res) => {
    const result = await userService.saveProfile(req.body);
    res.send(result);
};

const getSocialPersonaId = async (req, res) => {
    const result = await userService.getSocialPersonaId();
    res.send(result);
};


const createProfile = async (req, res) => {
    const result = await userService.createProfile(req.body);
    res.send(result);
};

const listSocialEntities = async (req, res) => {
    const result = await userService.listSocialEntities();
    res.send(result);
};

const createSocialPersona = async (req, res) => {
    const result = await userService.createSocialPersona(req.body);
    res.send(result);
};

const getSocialStats = async (req, res) => {
    const result = await userService.getSocialStats(req.body);
    res.send(result);
};


module.exports = {
    follow,
    paginateProfiles,
    loadProfile,
    saveProfile,
    getSocialPersonaId,
    createProfile,
    listSocialEntities,
    createSocialPersona,
    loadProfileData,
    getSocialStats
};