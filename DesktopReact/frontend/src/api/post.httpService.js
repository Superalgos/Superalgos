import {GET, httpRequest, POST} from './httpConfig'

function createPost(postBody) {
    return httpRequest('/posts', POST, postBody);
}

function getPosts(queryParams) {
    return httpRequest('/posts', GET, undefined, queryParams);
}

function reactedPost(postBody) {
    return httpRequest('/posts/reactions', POST, postBody);
}

export {
    createPost,
    getPosts,
    reactedPost
}