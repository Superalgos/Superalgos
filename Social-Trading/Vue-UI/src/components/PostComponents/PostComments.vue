<template>
    <div id="post-comments-component-div">
        <post :timestamp="postData.timestamp" 
                :userHandle="postData.userHandle"  
                :postBody="postData.postBody" 
                :postImage="postData.postImage" 
                :originPostHash="postData.originPostHash" 
                :originPost="postData.originPost"
                :eventType="postData.eventType"
                :commentCount='postData.commentCount'
            />

        <comment-list />
        <comment-input />
    </div>
</template>

<script>
import CommentInput from '../CommentComponents/CommentInput.vue'
import commentList from '../CommentComponents/CommentList.vue'
import Post from './Post.vue'
export default {
  components: { Post, commentList, CommentInput },
    name: 'post-comments',
    props: [ 'postData' ],
    data() {
        return {
        }
    },
    methods: {
    },
    computed: {
    }

}
</script>

<style>

</style>