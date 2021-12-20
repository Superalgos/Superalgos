import {
    httpRequest,
    GET,
    POST
} from './httpConfig'

function createPost(postBody) {
    return httpRequest('/createPost', POST, postBody);
}

function getPosts(postBody) {
    return httpRequest('/getPosts', GET, postBody);
}

export {
    createPost, 
    getPosts
}