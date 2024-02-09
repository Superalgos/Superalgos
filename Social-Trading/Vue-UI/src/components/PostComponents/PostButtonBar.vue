<template>
<div class="btn-bar-main-div">
    <div :id="id" class="post-button-bar">
        <!-- Comment Post Button -->
        <p class="post-button-bar-buttons"             v-on:click="openPostComments" v-if="!$store.state.showPostComments">
            <img src="../../assets/iconmonstrCommentIcon.png" alt="Comment" class="post-footer-buttons">
            &nbsp;&nbsp;  <strong> {{commentCount}} </strong>
        </p>

        <!-- Like Post Button -->
        <p id="like-comment-btn" class="post-button-bar-buttons" v-on:click="reactPost">
            <img id="like-button" src="../../assets/iconmonstrLikeIcon.png" alt="Comment" class="post-footer-buttons">
            &nbsp;&nbsp; <strong> {{getReactions[0][1]}} </strong>
        </p>

        <!-- Love Post Button -->
            <p id="love-post-btn" class="post-button-bar-buttons" v-on:click="reactPost">
                <img id="love-button" src="../../assets/iconmonstrHeartIcon.png" alt="Comment" class="post-footer-buttons">
                &nbsp;&nbsp; <strong> {{getReactions[1][1]}} </strong>
            </p>
                

        <!-- React to Post Button -->
            <p class="post-button-bar-buttons"       v-on:click="showEmojiReactions">
                <img src="../../assets/iconmonstrEmojiIcon.png" alt="Comment" class="post-footer-buttons">
                &nbsp;
            </p>
                
        <!-- Repost Post Button -->
            <p class="post-button-bar-buttons"       v-on:click="createRepost">
                <img src="../../assets/iconmonstrRepostIcon.png" alt="Comment" class="post-footer-buttons">
                &nbsp;Repost
            </p>
        </div>
        <div class="emoji-picker-component" v-if="showEmojiReactionTable">
                <reaction-picker
                    @reaction-sent="handleReactionSent"
                    :postReaction="true" 
                    :location="displayLocation" 
                    :originSocialPersonaId="originSocialPersonaId"
                    :originPostHash="originPostHash"
                />
        </div>
    </div>

</template>

<script>
import { reactedPost, getReplies, repostPost, getFeed, getPost } from '../../services/PostService';
import { getProfileData } from '../../services/ProfileService';
import store from '../../store/index'
import ReactionPicker from '../EmojiComponents/ReactionPicker.vue';

export default {
  components: { ReactionPicker },
    name: "post-button-bar",
    props: ['id', 'reactions', 'commentCount', 'timestamp', 'userName', 'postBody', 'postImage', 'originPostHash', 'originSocialPersonaId', 'fileKeys', 'targetPostHash', 'postersName'],
    data() {
        return {
            showEmojiReactionTable: false,
            displayLocation: undefined
        }
    },
    methods: {
        // Comments Button
        openPostComments() {
            let postCommentProps = {
                timestamp: this.timestamp,
                userName: this.userName,
                postBody: this.postBody,
                postImage: this.postImage,
                originPostHash: this.originPostHash,
                originSocialPersonaId: this.originSocialPersonaId,
                commentCount: this.commentCount,
                reactions: this.reactions,
                postersName: this.postersName,
            }


            let messageP = {
                    originSocialPersonaId: this.originSocialPersonaId,
                    originPostHash: this.originPostHash,
                    targetSocialPersonaId: this.originSocialPersonaId,
                    targetPostHash: this.targetPostHash,
                    fileKeys: this.fileKeys
                }


            getPost(messageP)
                    .then(response => {
                        let r = response;
                        
                        if (r.data.data !== undefined) {
                            this.postMessage = r.data.data.postText;
                        

                        if (r.data.data.originSocialPersona !== undefined) {
                            let originSocialPersonaData = r.data.data.originSocialPersona

                            this.posterName = originSocialPersonaData.socialPersonaHandle

                            let thisPostData = {
                                userName: this.posterName,

                                postBody: this.postMessage,
                                isRepost: true,

                                repostReactions: r.data.data.reactions,

                                reactions: this.reactions,

                                repostTimestamp: r.data.data.timestamp
                            }

                            postCommentProps.repostTimestamp = thisPostData.repostTimestamp;

                            postCommentProps.userName = thisPostData.userName;

                            postCommentProps.postBody = thisPostData.postBody;

                            postCommentProps.isRepost = true;

                            postCommentProps.repostReactions = thisPostData.repostReactions;

                            postCommentProps.reactions = thisPostData.reactions

                            store.commit("ADD_REPOST_TEXT_NAME", thisPostData);
                            }
                        }
                    });

            store.commit("SET_POST_COMMENT_PROPS", postCommentProps);
            store.commit("SHOW_POSTS_COMMENTS", true);

            let message = {
                originSocialPersonaId: this.originSocialPersonaId,
                originPostHash: this.originPostHash
            }

            getReplies(message)
                .then(response => {
                    let responseData =  response.data.data
                    let postComments = [];
                    // We loop through all comments and add them to an array to pass to the commentList component.
                    if (responseData !== undefined) {
                        if (responseData.length !== undefined) {
                            for(let i = 0; i < responseData.length; i++) {
                                postComments.unshift(responseData[i])
                            }
                        }
                        // Send the post comments to the store for use in another component.
                        store.commit("SET_POST_COMMENTS_ARRAY", postComments);
                    }
                    // We get the profile data of the poster to display at the top. (banner, username, profilePic, ect)
                    getProfileData(message)
                        .then(dataResponse => {
                            let headerProfileData = dataResponse.data
                            store.commit("SET_HEADER_PROFILE_DATA", headerProfileData)
                        });
                    });
        },
        // This sends a post reaction - either like/love directly or through setting the emoji reaction key in the store.
        // Like/Love or Emoji Reaction Buttons
        reactPost(event) {
            let reactWithEventType = 0;
            let emojiReactionId = store.state.emojiReactionKey;
            let targetId = undefined;
            // If we have a valid target ID then this is a liked or loved post.
            if (emojiReactionId === undefined) {
                targetId = event.target.id;
                if (targetId === 'like-button' ) {
                    reactWithEventType = 700;
                } else if (targetId === 'love-button') {
                    reactWithEventType = 701;
                }
            } else {
                // This is an emoji reaction. 
                reactWithEventType = (700 + emojiReactionId)
                store.commit('SET_EMOJI_REACTION_KEY', undefined);
            }

            let message = {
                originSocialPersonaId: store.state.profile.nodeId,
                targetSocialPersonaId: this.originSocialPersonaId,
                postHash: this.originPostHash,
                eventType: reactWithEventType,
            }
            reactedPost(message)
            .then(response => {
                let responseData = response.data
                // Check for Success
                if (responseData.result === "Ok") {
                    // We handle what to render back on the screen.
                    if (emojiReactionId === undefined) {
                    targetId === 'like-button' 
                    ? this.reactions[0][1] += 1
                    : this.reactions[1][1] += 1
                    }
                }
                });
        },
        // This opens the emojiPicker.
        // Emoji Reaction Button
        showEmojiReactions(event) {
            if (event !== undefined) {
            // We get the location of the click event
            let clickLocation = {
                    x: event.pageX,
                    y: event.pageY
            }

            this.displayLocation = clickLocation
            this.showEmojiReactionTable == true
                ? this.showEmojiReactionTable = false
                : this.showEmojiReactionTable = true
            }
        },
        // This closes the emojiPicker component after reaction is sent.
        handleReactionSent() {
            this.showEmojiReactionTable = false;
        },

        createRepost() {

            let message = {
                originSocialPersonaId: this.getSocialPersonaId,
                targetSocialPersonaId: this.originSocialPersonaId,
                originPostHash: this.originPostHash + store.state.profile.name,
                targetPostHash: this.originPostHash,
                fileKey: this.fileKeys,
                posterName: store.state.profile.name
            }

            repostPost(message)
                .then(response => {
                    console.log(response)
                    if (response.result === 'Ok') {
                        getFeed();
                    }
                });
        }
    },
    computed: {
        getSocialPersonaId() {
            return store.state.profile.nodeId;
        },
    // TODO REVIEW
        getReactions() {
            if (this.reactions !== undefined) {
                return this.reactions
            } else {
                let emptyReactionArray = [ [0, 0], [1, 0] ];
                return emptyReactionArray;
            }
        }
    }
}
</script>

<style>

.btn-bar-main-div {
    width: 100%;
}

.post-button-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
    border-bottom: solid .1px rgba(27, 27, 27, 0.658);
}

.post-button-bar-buttons {
    display: flex;
    align-items: center;
    padding: 0.75% 1%;
    white-space: hide;
    font-size: 1vw;
    margin: 0%;
}

.post-button-bar-buttons:hover {
    border-radius: 30px;
    background-color: rgba(182, 182, 182, 0.281);
    padding: 0% 1%;
    cursor: pointer;
}

.emoji-picker-component {
    display: fixed;
}



</style>