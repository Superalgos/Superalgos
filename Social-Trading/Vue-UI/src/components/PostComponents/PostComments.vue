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

        <comment />
    </div>
</template>

<script>
import Comment from './Comment.vue'
import Post from './Post.vue'
export default {
  components: { Post, Comment },
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