import axios from 'axios';
import store from '../store/index'

const http = axios.create({
    baseURL: "http://localhost:33248",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});



    /* Used for creating new posts */
    async function createPost(body) {
        return http.post('/posts', body)
                .then(response => {
                    console.log(`Create new post response status = ${response.status}`)
                });

    }

    /* Used for removing a post */
    async function removePost(body) {
        return  http.delete('/posts', {params: body})
                .then(response => {
                    return response
                });
    }

    /* Used to get past 20 posts from a User */
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


    /* Used to get a paticular post from a user */
    async function getPost(queryParams) {
        return http.get('/posts/post', {params: queryParams})
            .then(response => {
                console.log("RESPONSE IS BACK");
                return response
            });
    }

    // Working 
    // Returns all activity, posts, likes, reposts, loves, ect.
    // Can be sorted by eventType for conditional displaying.
    async function getFeed() {
        return  http.get('/posts/feed')
                .then(response => {
                    let postsArray = response.data.data;
                    let postsToStore = []
                    for (let i = 0; i < postsArray.length; i++) {
                        let thisPost = postsArray[i];

                        if (thisPost.eventType === 10 || 
                            thisPost.eventType === 12 ) {
                            postsToStore.push(thisPost)
                        }
                    }
                    store.commit("ADD_POST", postsToStore)
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


    /* Used to get the replies from a post */
    async function getReplies(queryParams) {
        return http.get('/posts/replies', {params: queryParams}).then(result => {
            return result;
        })
    }


    /* Used to reply to a post */
    async function createReply(body) {
        return http.post('/posts/replies', body);
    }


    /* Used to re-post a post */
    async function repostPost(body) {
        return http.post('/posts/repost', body)
            .then(result => {
                return result.data;
            });
    }

export {
    createPost,
    removePost,
    getPosts,
    getPost,
    reactedPost,
    getFeed,
    createReply,
    getReplies,
    repostPost
}
