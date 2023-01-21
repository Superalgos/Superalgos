<template>
    <!-- This component retrieves the array of posts from the store and passes them one by one to the Post component to be displayed. -->
        <div v-for="post in posts" v-bind:key="post" >
            <div>
                <post 
                    :timestamp="post.timestamp" 
                    :userHandle="post.originSocialPersona.socialPersonaHandle"  
                    :postBody="post.postText" 
                    :postImage="post.postImage" 
                    :originPostHash="post.originPostHash" 
                    :originPost="post.originPost"
                    :eventType="post.eventType"
                    :commentCount='getRepliesCount(post)'
                />
            </div>
        </div>
</template>

<script>
import Post from './Post.vue'
import { getFeed } from '../../services/PostService'

export default {
    name: 'posts-list',
    postList: [],
    components: {
        Post
    },
    computed: {
        posts() {
            return this.$store.state.posts;
        }
    },
    methods: {
        getRepliesCount(post) {
            
            if(post.originPost !== undefined) {
                // If the post has a reply count we grab it.
                if (post.originPost.repliesCount !== undefined) {
                    console.log(post.originPost.repliesCount)
                    return post.originPost.repliesCount
                } else {
                    return
                }
            } else {
                console.log("[WARN] (PostComponents/PostList.vue) The origin post is undefined.")
            }
        }
    },
    data() {
        return {
        }
    },
    created() {
        getFeed()
    }
    

}
</script>

<style>

</style>