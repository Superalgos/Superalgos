<template>
    <div id="comment-object">
    
        <comment 
            id="comment"
            v-for="post in posts" 
            v-bind:key="post.postID" 
            
        />

    </div>
</template>

<script>
import Comment from '../PostComponents/Comment.vue'



export default {
    name: 'comments-list',
    props: ['posts'],
    data() {
        return {
            comment: {
                username: '',
                dateTime: '',
                comments: []
            }
        }
    },
    components: { Comment },
    computed: {
    }

}
</script>

<style>



</style>