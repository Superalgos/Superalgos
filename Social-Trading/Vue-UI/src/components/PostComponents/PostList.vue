<template>
    <!-- This component retrieves the array of posts from the store and passes them one by one to the Post component to be displayed. -->
        <div v-for="post in posts" v-bind:key="post" >
            <div>
                <post 
                    :timestamp="post.timestamp" 
                    :userHandle="post.originSocialPersona.socialPersonaHandle"  
                    :postBody="post.postText" 
                    :postImage="post.postImage"
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
        },
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