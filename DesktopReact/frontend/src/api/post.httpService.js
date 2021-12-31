import {GET, httpRequest, POST} from './httpConfig'

function createPost(postBody) {
    return httpRequest('/posts', POST, postBody);
}

function getPosts(queryParams) {
    return httpRequest('/posts', GET, undefined, queryParams);
}

export {
    createPost, 
    getPosts
}