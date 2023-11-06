<template>
    <!-- This component retrieves the array of posts from the store and passes them one by one to the Post component to be displayed. -->
        <div  >
            <div class="post-container" v-for="post in posts" v-bind:key="post.index">

                <!-- We add the current post to the DOM -->
                <!-- A Regular Post -->
                <div v-if="postIsRepost(post) !== true">
                    <post-component 
                        :timestamp="post.timestamp"  
                        :userName="post.userName"
                        :postBody="post.postText" 
                        :postImage="post.postImage" 
                        :originPostHash="post.originPostHash" 
                        :id="post.index"
                        :reactions="post.reactions"
                        :originSocialPersonaId="post.originSocialPersonaId"
                    />
                </div>
                <!-- A RePost -->
                <div v-if="postIsRepost(post) === true">
                    <re-post-component 
                        :timestamp="post.timestamp"
                        :userName="post.originSocialPersona.socialPersonaHandle"
                        :repostPostersName="getRepostersName"
                        :reactions="post.originPost.reactions"
                        :repostReactions="post.targetPost.reactions"
                        :originSocialPersonaId="post.originSocialPersonaId"
                        :originPostHash="post.originPostHash"
                        :targetSocialPersonaId="post.targetSocialPersonaId"
                        :targetPostHash="post.targetPostHash"
                        :fileKeys="post.targetPost.fileKeys"
                        :repostTimestamp="post.targetPost.timestamp"
                    />
                </div>
                <!-- We add the current posts button-bar -->
                <div class="post-button-bar">
                    <post-button-bar 
                        :id="post.index" 
                        :reactions="post.originPost.reactions" :commentCount='getRepliesCount(post)' 
                        :timestamp="post.timestamp"  
                        :userName="post.userName"
                        :postBody="post.postText" 
                        :postImage="post.postImage" 
                        :originPostHash="post.originPostHash" 
                        :originSocialPersonaId="post.originSocialPersonaId"
                        :postersName="post.postersName"
                        :targetPostHash="post.targetPostHash"
                        :fileKeys="getFileKeys(post)"
                        />
                </div>
            </div>
        </div>
</template>



<script>
import store from '../../store/index';
import PostComponent from './PostComponent.vue';
import PostButtonBar from './PostButtonBar.vue';
import { getFeed } from '../../services/PostService';
import RePostComponent from './RePostComponent.vue';


export default {
    name: 'posts-list',
    postList: [],
    components: {
        PostComponent,
        PostButtonBar,
        RePostComponent
    },
    data() {
        let posterName = undefined;
        return {
            posterName: undefined,
            postMessage: undefined,
            postReactions: undefined
        }
    },
    methods: {
        getRepliesCount(post) {
            if(post !== undefined) {
                // If the post has a reply count we grab it.
                if (post.originPost !== undefined) {
                    if (post.originPost.repliesCount !== undefined) {
                        return post.originPost.repliesCount
                    }
                } else {
                    return 0;
                }
            } else {
                console.log("[WARN] (PostComponents/PostList.vue) The origin post is undefined.")
                return 0;
            }
        },
        firstLoadPosts() {
            if (store.state.posts.length === 0) {
            console.log("Network node not connected yet...");
            getFeed();
                setTimeout(() => {
                    this.firstLoadPosts();
                }, 10000); // wait for 10 seconds
            }
        },
        getFileKeys(post) {
            return post.fileKeys !== undefined ? post.fileKeys : post.targetPost.fileKeys;
        },
        postIsRepost(post) {
            return post.eventType !== 12 ? false : true;
        },
    },
    computed: {
        // We gather all posts that are posts (filtering out all comments)
        posts() {
            let postArray = store.state.posts;
            let displayPosts = [];
            postArray.forEach(post => {
                if (post.reactions === undefined) {
                    console.log("THE POSTS REACTIONS ARE UNDEFINED!!")
                    console.log(post.targetPost)
                }
                displayPosts.push(post)
            });
            return displayPosts;
        },
        getRepostersName() {
            return this.posterName;
        },
        getPostMessage() {
            return this.postMessage;
        }
    },

    created() {
        getFeed();
        if (store.state.posts.length === 0) {
            console.log("Network node not connected yet...");
            setTimeout(() => {
                this.firstLoadPosts();
            }, 5000); // wait for 10 seconds
        }
    },
    watch: {
        posts(newValue, oldValue) {
            this.displayPosts = newValue;
        }

    }
    

}
</script>

<style>

.post-container:hover {
    background-color: rgb(247, 247, 247);
}

</style>