import {GET, httpRequest, POST} from './httpConfig'

function createPost(body) {
    return httpRequest('/posts', POST, body);
}

function getPosts() {
    return httpRequest('/posts', GET, undefined);
}

function getPost(queryParams) {
    return httpRequest('/posts/post', GET, undefined, queryParams);
}

function getFeed() {
    return httpRequest('/posts/feed', GET, undefined);
}

function reactedPost(body) {
    return httpRequest('/posts/reactions', POST, body);
}

function getReplies(queryParams) {
    return httpRequest('/posts/replies', GET, undefined, queryParams);
}

function createReply(body) {
    return httpRequest('/posts/replies', POST, body);
}

export {
    createPost,
    getPosts,
    getPost,
    reactedPost,
    getFeed,
    createReply,
    getReplies
}