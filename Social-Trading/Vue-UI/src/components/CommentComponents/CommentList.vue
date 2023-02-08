<template>
<div>
    <div id="post-comments-list" v-for="comment in getPostComments" v-bind:key="comment.index">
        <comment
                :timestamp="comment.timestamp" 
                :userHandle="comment.originSocialPersona.socialPersonaHandle"  
                :postBody="comment.postText" 
                :postImage="comment.postImage" 
                :originPostHash="comment.originPostHash" 
                :originPost="comment.originPost"
                :eventType="comment.eventType"
            />
    </div>
</div>
</template>

<script>
import store from '../../store/index'
import Comment from '../CommentComponents/Comment.vue'

export default {
    name: 'comments-list',
    data() {
        return {}
    },
    components: { Comment },
    computed: {
        getPostComments() {
            return store.state.postComments
        }
    }
}
</script>
<style>

</style>