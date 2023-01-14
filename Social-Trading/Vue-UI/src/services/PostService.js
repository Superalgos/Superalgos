import axios from 'axios';
import store from '../store/index'

const http = axios.create({
    baseURL: "http://localhost:33248",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});


    async function createPost(body) {
        return http.post('/posts', body);
    }

    async function getPosts() {
        return http.get('/posts');
    }

    async function getPost(queryParams) {
        return http.get('/posts/post', queryParams)
            .then(response => {
                console.log(response.data)
                return response.data
            });
    }

    // Working
    async function getFeed() {
        return  http.get('/posts/feed')
                .then(response => {
                    let postsArray = response.data.data;
                    let postsToStore = []
                    for (let i = 0; i < postsArray.length; i++) {
                        let thisPost = postsArray[i];
                        postsToStore.push(thisPost)
                    }
                    store.commit("ADD_POST", postsToStore)
                    console.log(postsToStore)
                });
    }

    async function reactedPost(body) {
        return http.post('/posts/reactions', body);
    }

    async function getReplies(queryParams) {
        return http.get('/posts/replies', {params: queryParams});
    }

    async function createReply(body) {
        return http.post('/posts/replies', body);
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