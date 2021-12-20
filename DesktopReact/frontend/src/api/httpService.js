import {
    GET,
    POST,
    STATUS_OK,
    httpRequest
} from'./httpConfig'

function reactToPost(body) {
    return {
        status: 'ok', "reactions": [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]]
    }
}

function getProfiles() {
    return httpRequest('/profiles', GET);
}

function createPost(postBody) {
    return httpRequest('/createPost', POST, postBody);
}

function getPosts(postBody) {
    return httpRequest('/getPosts', GET, postBody);
}

export {
    STATUS_OK,
    getProfiles,
    createPost,
    followUser,
    getPosts
}

