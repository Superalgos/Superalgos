import {GET, httpRequest, POST} from './httpConfig'


function getSocialPersona() {
    return httpRequest('/users/social-persona', GET)
}

function getProfiles() {
    return httpRequest('/users/profiles', GET);
}

function getProfile(socialPersonaId) {
    return httpRequest('/users/profile', GET, undefined, socialPersonaId)
}

function getPaginationProfiles(initialPaginationIndex, pagination) {
    const body = {
        initialIndex: initialPaginationIndex,
        pagination: pagination
    }
    return httpRequest('/users/paginate-profiles', POST, body)
}

function updateProfile(profileData) {
    return httpRequest('/users/profile', POST, profileData)
}

function createProfile(profileData) {
    return httpRequest('/users/create-profile', POST, profileData)
}

function getProfileData(profileData) {
    return httpRequest('/users/profileData', POST, profileData)
}


export {
    getProfiles,
    getProfile,
    updateProfile,
    getPaginationProfiles,
    getSocialPersona,
    createProfile,
    getProfileData
}