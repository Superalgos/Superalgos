import {
    POST,
    httpRequest
} from './httpConfig'


function followUser(userProfileId, eventType) {
    return httpRequest('/users/follow', POST, { userProfileId: userProfileId, eventType: eventType})
}

export {
    followUser
}