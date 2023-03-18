<template>
    <!-- This component retrieves the array of posts from the store and passes them one by one to the Post component to be displayed. -->
        <div  >
            <div class="post-container" v-for="post in posts" v-bind:key="post.index">

                <!-- We add the current post to the DOM -->
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

                <!-- We add the current posts button-bar -->
                <div class="post-button-bar">
                    <post-button-bar 
                        :id="post.index" 
                        :reactions="post.reactions" :commentCount='getRepliesCount(post)' 
                        :timestamp="post.timestamp"  
                        :userName="post.userName"
                        :postBody="post.postText" 
                        :postImage="post.postImage" 
                        :originPostHash="post.originPostHash" 
                        :originSocialPersonaId="post.originSocialPersonaId"
                        />
                </div>
            </div>
        </div>
</template>



<script>
import store from '../../store/index';
import PostComponent from './PostComponent.vue';
import PostButtonBar from './PostButtonBar.vue';
import { getPosts } from '../../services/PostService';


export default {
    name: 'posts-list',
    postList: [],
    components: {
        PostComponent,
        PostButtonBar
    },
    data() {
        return {
        }
    },
    methods: {
        getRepliesCount(post) {
            if(post !== undefined) {
                // If the post has a reply count we grab it.
                if (post.repliesCount !== undefined) {
                    return post.repliesCount
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
            getPosts();
                setTimeout(() => {
                    this.firstLoadPosts();
                }, 10000); // wait for 10 seconds
            }
        }
    },
    computed: {
        // We gather all posts that are posts (filtering out all comments)
        posts() {
            let postArray = store.state.posts;
            let displayPosts = [];
            postArray.forEach(post => {
                if (post.postType === 0) {
                    displayPosts.push(post)
                }
            });
            return displayPosts;
        }
    },

    created() {
        getPosts();
        if (store.state.posts.length === 0) {
            console.log("Network node not connected yet...");
            setTimeout(() => {
                this.firstLoadPosts();
            }, 5000); // wait for 10 seconds
        }
    }

    
    

}
</script>

<style>

.post-container:hover {
    background-color: rgb(247, 247, 247);
}

</style>