import {GET, httpRequest, POST} from './httpConfig'

function createPost(postBody) {
    return httpRequest('/posts', POST, postBody);
}

function getPosts() {
    return httpRequest('/posts', GET, undefined);
}

function getFeed() {
    return httpRequest('/posts/feed', GET, undefined);
}

function reactedPost(postBody) {
    return httpRequest('/posts/reactions', POST, postBody);
}

function getReplies(postBody) {
    return httpRequest('/posts/replies', POST, postBody);
}

export {
    createPost,
    getPosts,
    reactedPost,
    getFeed
}