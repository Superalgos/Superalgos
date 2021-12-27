import {
    POST,
    httpRequest
} from './httpConfig'

const followUser = (userProfileId) =>{
   return httpRequest('/users/follow', POST, { userProfileId: userProfileId })
}

function unfollowUser(userProfileId) {
    return httpRequest('/users/unFollow', POST, { userProfileId: userProfileId })
}

export {
    followUser,
    unfollowUser
}