<template>
    <div id="post-comments-component-div">
        <!-- We render in the post we are looking at -->
        <post-component 
                :timestamp="postData.timestamp" 
                :userName="postData.userName"  
                :postBody="postData.postBody" 
                :postImage="postData.postImage" 
                :originPostHash="postData.originPostHash" 
        />
        <!-- We add the post-button-bar to this post -->
        <post-button-bar :reactions="postData.reactions" 
                        :originPostHash="postData.originPostHash" 
                        :originSocialPersonaId="postData.originSocialPersonaId"
                        />
        <!-- We display all comments this post has. -->
        <comment-list />
        <!-- We display the input field for adding new comments. -->
        <comment-input />
    </div>
</template>

<script>
import CommentInput from '../CommentComponents/CommentInput.vue'
import commentList from '../CommentComponents/CommentList.vue'
import PostButtonBar from './PostButtonBar.vue'
import PostComponent from './PostComponent.vue'
export default {
    components: { commentList, CommentInput, PostComponent, PostButtonBar },
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