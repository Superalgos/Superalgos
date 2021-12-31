import {GET, httpRequest, POST} from './httpConfig'

function getProfiles() {
    return httpRequest('/users/profiles', GET);
}

function getProfile(queryParams) {
    return httpRequest('/users/profile', GET, undefined, queryParams)
}

function getPaginationProfiles(initialPaginationIdex, pagination) {
    const body = {
        initialIndex: initialPaginationIdex,
        pagination: pagination
    }
    return httpRequest('/users/paginate-profiles', POST, body)
}

function updateProfile(profileData) {
    return httpRequest('/users/profile', POST, profileData)
}

export {
    getProfiles,
    getProfile,
    updateProfile,
    getPaginationProfiles
}