<template>
    <post
        id="post"
        v-for="posts in $store.state.posts" 
        v-bind:key="posts.postID" 
        v-bind:posts="posts" />
</template>

<script>

import Post from '../components/PostComponents/Post.vue'

export default {
    name: 'posts-list',
    props: ['posts'],
    components: {
        Post
    },
    computed: {
    },
    data() {
        return {
            post: {
            }
        }
    }

}
</script>

<style>

#post {
    justify-content: center;
}

</style>