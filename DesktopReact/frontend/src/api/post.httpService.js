import {
    httpRequest,
    GET,
    POST
} from './httpConfig'

function createPost(postBody) {
    return httpRequest('/posts', POST, postBody);
}

function getPosts(postBody) {
    return httpRequest('/posts', GET, postBody);
}

export {
    createPost, 
    getPosts
}