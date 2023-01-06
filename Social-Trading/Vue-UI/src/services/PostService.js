import axios from 'axios';

const http = axios.create({
    baseURL: "http://localhost:33248",
});

const headers = new Headers({'Accept': 'application/json', 'Content-Type': 'application/json'});


    async function createPost(body) {
        return http.post('/posts', headers, body);
    }

    async function getPosts() {
        return http.get('/posts', headers);
    }

    async function getPost(queryParams) {
        return http.get('/posts/post', headers, queryParams);
    }

    async function getFeed() {
        return http.get('/posts/feed', headers);
    }

    async function reactedPost(body) {
        return http.post('/posts/reactions', headers, body);
    }

    async function getReplies(queryParams) {
        return http.get('/posts/replies', headers, queryParams);
    }

    async function createReply(body) {
        return http.post('/posts/replies', headers, body);
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