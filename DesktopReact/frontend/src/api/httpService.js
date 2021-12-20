const baseURL = 'http://localhost:33248';
const GET = 'GET', POST = 'POST', DELETE = 'DELETE', UPDATE = 'UPDATE', PUT = 'PUT';
const STATUS_OK = 'Ok';
const headers = new Headers({'Accept': 'application/json', 'Content-Type': 'application/json'});

function followUser() {

}

function unfollowUser() {

}

function reactToPost(body) {
    return {
        status: 'ok', "reactions": [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]]
    }

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
    console.log(body)
    return fetch(baseURL + endpoint, {method: method, body: body, headers: headers, mode: 'cors'})
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

