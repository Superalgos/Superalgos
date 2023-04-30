<template>
    <div :id="id" class="post-object-container" >
        <div class="post-object">
            <!-- RePost Header -->
            <div id="post-user-name-div">
                <p class="post-user-name"> {{this.userName}} </p>
                <p class="post-date"> &nbsp; &#9702; {{this.postDate}} </p>
            </div>
            <div class="date-time header-right">
                <!-- Reactions on post displayed here -->
                <div class="emoji-reactions emoji-reaction-area" 
                v-if="hasReactions?.length"  
                >
                    <div v-for="reaction in hasReactions" v-bind:key="reaction.emoji">
                        <p class="reaction-emoji">{{reaction.emoji}}</p>
                        <p class="reaction-count">{{reaction.reactionCount}}</p>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                </div>

                <p class="post-date-time">{{formatTimestamp}}</p>
            </div>
            <!-- RePost Message -->
            <div class="post-message">
                <div class="repost">
                    <div class="repost-header">
                        <!-- Here we show the repost header info in the main post list -->
                        <div class="post-user-name-div repost-username-div" v-if="this.repostPostersNameData">
                            <p class="post-user-name align-bottom">
                                {{this.repostPostersNameData}}
                            </p>
                            <p class="post-date repost-date">
                                &nbsp; &#9702; {{this.postDate}}
                            </p>
                        </div>
                        <!-- Here we show the repost header in the comment list -->
                        <div class="post-user-name-div repost-username-div" v-if="this.repostPostersNameData === undefined">
                            <p class="post-user-name align-bottom">
                                {{this.repostPostersName}}
                            </p>
                            
                            <p class="post-date repost-date">
                                &nbsp; &#9702; {{this.repostDate}}
                            </p>
                        </div>
                        <div class="repost-date-time">
                        <!-- Reactions on Repost displayed here -->
                            <div class="emoji-reactions emoji-reaction-area" 
                            v-if="hasRepostReactions?.length"  
                            >
                                <div v-for="reaction in hasRepostReactions" v-bind:key="reaction.emoji">
                                
                                    <p class="reaction-emoji">{{reaction.emoji}}</p>
                                    <p class="reaction-count">{{reaction.reactionCount}}</p>
                                </div>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                            </div>

                            <p class="post-date-time">{{this.reTimestamp}}</p>
                        </div>
                    </div>
                    <div class="repost-body">
                        <!-- We show the repost message in the main list of posts -->
                        <div v-if="this.postMessageData">
                            <p class="repost-message">
                            {{this.postMessageData}}
                            </p>
                        </div>
                        <!-- We show the repost message in the comment view of this repost -->
                        <div v-if="this.postMessage">
                            <p class="repost-message">
                            {{this.postMessage}}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import EmojiReactions from '../../../utils/EmojiReactions';
import { getPost } from '../../services/PostService';


export default {
    name: 're-post-component',
    props: ['timestamp', 'userName', 'repostPostersName', 'reactions', 'originSocialPersonaId', 'originPostHash', 'targetSocialPersonaId', 'targetPostHash', 'fileKeys', 'postMessage', 'repostTimestamp', 'repostReactions'],
    data() {
        return {
            postMessageData: undefined,
            repostPostersNameData: undefined,
            repostTimestampData: undefined,
            postDate: undefined,
            repostDate: undefined,
            reTimestamp: undefined
        }
    },
    methods: {
        getRepostData() {

            let message = {
                originSocialPersonaId: this.originSocialPersonaId,
                originPostHash: this.originPostHash,
                targetSocialPersonaId: this.originSocialPersonaId,
                targetPostHash: this.targetPostHash,
                fileKeys: this.fileKeys
            }

            getPost(message)
                .then(response => {
                    console.log("response back in repost");
                    console.log(response);
                });
        },
        formatRepostTimestamp() {
            const rDate = new Date(this.repostTimestamp);

            let timeString = rDate.toLocaleString();
            // We remove the seconds from the time.
            let time = timeString.split(',')
            this.repostDate = time[0]
            let exactTime = time[1]
            let postTime = exactTime.slice(0, 6)
            let amPm = exactTime.slice(exactTime.length - 3, exactTime.length)
            console.log(amPm)
            // If time ends in a ":" we need to shorten our split.
            if (postTime.slice(-1) === ':') {
                postTime = exactTime.slice(0, 5);
            }
            return postTime + amPm;
        },
        getPostData() {
            let message = {
                originSocialPersonaId: this.originSocialPersonaId,
                originPostHash: this.originPostHash,
                targetSocialPersonaId: this.originSocialPersonaId,
                targetPostHash: this.targetPostHash,
                fileKeys: this.fileKeys
            }

            getPost(message)
                .then(response => {
                    if (response.statusText == 'OK') {
                    let responseData = response.data.data;

                    this.postMessageData = responseData.postText;

                    this.repostPostersNameData = responseData.originSocialPersona.socialPersonaHandle;

                    this.reTimestamp = this.formatRepostTimestamp();
                    }
                });

        }
    },
    computed: {
        formatTimestamp() {
            const date = new Date(this.timestamp);
            let timeString = date.toLocaleString();
            // We remove the seconds from the time.
            let time = timeString.split(',')
            this.postDate = time[0]
            let exactTime = time[1]
            let postTime = exactTime.slice(0, 6)
            let amPm = exactTime.slice(exactTime.length - 3, exactTime.length)
            // If time ends in a ":" we need to shorten our split.
            if (postTime.slice(-1) === ':') {
                postTime = exactTime.slice(0, 5);
            }
            return postTime + amPm;
        },
        getConvertedRepostTimestamp() {
            const date = new Date(this.repostTimestamp);
            let timeString = date.toLocaleString();
            // We remove the seconds from the time.
            let time = timeString.split(',')
            this.repostDate = time[0]
            let exactTime = time[1]
            let postTime = exactTime.slice(0, 6)
            let amPm = exactTime.slice(exactTime.length - 3, exactTime.length)
            // If time ends in a ":" we need to shorten our split.
            if (postTime.slice(-1) === ':') {
                postTime = exactTime.slice(0, 5);
            }
            return postTime + amPm;
        },
        hasRepostReactions() {
            let reactionsArray = [];
            if (this.repostReactions !== null && this.repostReactions !== undefined) {
                for (let i = 2; i < this.repostReactions.length; i++) {
                    let reaction = this.repostReactions[i];
                    if (reaction[1] > 0) {
                        let reactionIndex = reaction[0]
                        let newReaction = {
                            emoji: EmojiReactions[reactionIndex - 1],
                            reactionCount: reaction[1]
                        }
                        reactionsArray.push(newReaction);
                    }
                }
                return reactionsArray;
            }
        },
        hasReactions() {
            let reactionsArray = [];
            if (this.reactions !== null && this.reactions !== undefined) {
                for (let i = 2; i < this.reactions.length; i++) {
                    let reaction = this.reactions[i];
                    if (reaction[1] > 0) {
                        let reactionIndex = reaction[0]
                        let newReaction = {
                            emoji: EmojiReactions[reactionIndex - 1],
                            reactionCount: reaction[1]
                        }
                        reactionsArray.push(newReaction);
                    }
                }
                return reactionsArray;
            }
        },
    },
    created() {

        // We verify all needed data is ready.
        if (this.originSocialPersonaId && 
            this.originPostHash && 
            this.targetSocialPersonaId &&
            this.targetPostHash &&
            this.fileKeys) {
            this.getPostData()
        }

        let message = {
                originSocialPersonaId: this.originSocialPersonaId,
                originPostHash: this.originPostHash,
                targetSocialPersonaId: this.originSocialPersonaId,
                targetPostHash: this.targetPostHash,
                fileKeys: this.fileKeys
            }

            getPost(message)
                .then(response => {
                    if (response.statusText == 'OK') {
                    this.reTimestamp = this.formatRepostTimestamp();
                    }
                });
    }
}
</script>

<style>

</style>