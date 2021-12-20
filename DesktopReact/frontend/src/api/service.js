const baseURL = 'http://localhost:33248';
const GET = 'GET';
const POST = 'POST';
const DELETE = 'DELETE';
const UPDATE = 'UPDATE';
const STATUS_OK = 'Ok';

function followUser() {

}
function unfollowUser() {

}

function getProfiles() {
    return call('/profiles', GET);
}

function createPost(postBody) {
    return call('/createPost', POST, postBody);
}

function getPosts(postBody) {
    return call('/getPosts', GET, postBody);
}

function call(endpoint, method, body) {
    return fetch(baseURL + endpoint, {method: method, body: body})
        .then(response => response)
        .catch(error => error)
}

export {
    STATUS_OK,
    getProfiles,
    createPost,
    followUser,
    getPosts
}

