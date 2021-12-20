import {
    baseURL,
    GET, 
    POST,
    DELETE
} from './httpConfig'

const followUser = (userProfileId) =>{
   return httpRequest('/follow', POST, { userProfileId: userProfileId })
}

function unfollowUser(userProfileId) {
    return httpRequest('/unFollow', POST, { userProfileId: userProfileId })
}

export {
    followUser,
    unfollowUser
}