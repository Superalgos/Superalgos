import {
    GET,
    POST,
    STATUS_OK,
    httpRequest
} from'./httpConfig'

function reactToPost(body) {
    return {
        status: 'ok', "data": [[0, 52], [1, 3], [2, 8], [3, 1], [4, 9], [5, 5], [6, 17]]
    }
}
/*

function getProfiles() {
    return httpRequest('/profiles', GET);
}

function createPost(postBody) {
    return httpRequest('/createPost', POST, postBody);
}

function getPosts(postBody) {
    return httpRequest('/getPosts', GET, postBody);
}
*/

export {
    STATUS_OK,
    reactToPost
}

