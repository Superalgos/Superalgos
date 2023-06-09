<template>
    <div id="post-comments-component-div">
        <!-- We render in the post we are looking at -->
        <div v-if="postData.isRepost !== true">
            <post-component 
                    :timestamp="postData.timestamp"  
                    :userName="postData.userName"
                    :postBody="getPostBody" 
                    :postImage="postData.postImage" 
                    :originPostHash="postData.originPostHash"
                    :reactions="postData.reactions"
                    :originSocialPersonaId="postData.originSocialPersonaId"
                    :originPost="postData.originPost"
                    :targetSocialPersona="postData.targetSocialPersona"
                    :isRepost="postData.isRepost"
                    :repostReactions="postData.repostReactions"
                />
        </div>
        <div v-if="postData.isRepost === true">
            <re-post-component 
                :timestamp="postData.timestamp"
                :userName="postData.userName"
                :postMessage="repostData.postBody"
                :repostPostersName="repostData.userName"
                :repostReactions="repostData.repostReactions"
                :reactions="postData.reactions"
                :repostTimestamp="postData.repostTimestamp"
                />
        </div>
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
import RePostComponent from './RePostComponent.vue';
export default {
    components: { commentList, CommentInput, PostComponent, PostButtonBar, RePostComponent },
    name: 'post-comments',
    props: [ 'postData', 'repostData' ],
    data() {
        return {
        }
    },
    methods: {
        postIsRepost(post) {
            return post === undefined ? false : true;
        },
    },
    computed: {
        getUserName() {
            if (this.repostData !== undefined) {
                if (this.repostData.posterName !== undefined) {
                    return this.repostData.posterName;
                }
            } else {
                return this.postData.userName;
            }
        },
        getPostBody() {
            if (this.postData.postBody !== undefined) {
                return this.postData.postBody;
            }
        },
        getPostReactions() {
            return store.state.postCommentProps.reactions;
        }
    }

}
</script>

<style>

</style>