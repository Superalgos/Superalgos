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
        return http.post('/posts', body)
                .then(response => {
                    console.log(`Create new post response status = ${response.status}`)
                });

    }

    async function getPosts() {
        return http.get('/posts')
                .then(response => {
                    let postsArray = response.data.data;
                    let postsToStore = []
                    for (let i = 0; i < postsArray.length; i++) {
                        let thisPost = postsArray[i];
                        postsToStore.push(thisPost)
                    }
                    store.commit("ADD_POST", postsToStore)
                    return response.data.data;
                });
    }

    async function getPost(queryParams) {
        return http.get('/posts/post', queryParams)
            .then(response => {
                return response.data
            });
    }

    // Working 
    // Returns all activity, posts, likes, reposts, loves, ect.
    // Can be sorted by eventType for conditional displaying.
    // Full array of responses is stored in store under "posts".
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


    // TODO the logic on the back end so we can't double like.
    // Tested Working
    /*
        Expected "message":
        {
            originSocialPersonaId: store.state.profile.nodeId,
            targetSocialPersonaId: this.originPost.originSocialPersonaId,
            postHash: this.originPostHash,
            eventType: 100,
        }
    */
    async function reactedPost(message) {
        return http.post('/posts/reactions', message)
                .then(response => {
                    return response
                })
    }

    async function getReplies(queryParams) {
        return http.get('/posts/replies', {params: queryParams}).then(result => {
            return result;
        })
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