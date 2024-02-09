<template>
    <div :id="id" class="post-object-container" >
        <div class="post-object">
            <!-- Post Header -->
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
            <div class="post-message">
                <p id="post-body">{{postBody}}</p>
                <img class="post-image" :src="postImage" alt="">
            </div>
        </div>
    </div>
</template>

<script>
import EmojiReactions from '../../../utils/EmojiReactions';

export default {
    components: { },
    name: 'post-component',
    props: ['timestamp', 'userName', 'postBody', 'postImage', 'id', 'reactions', 'originPost'],
    data() {
        return {
            postDate: undefined,
            showEmojiReactionTable: false,
            displayLocation: undefined
        }
    },
    computed: {
        formatTimestamp() {
            const date = new Date(this.timestamp);
            let timeString = date.toLocaleString();
            // We remove the seconds from the time.
            let time = timeString.split(',')
            this.postDate = time[0]
            console.log(this.postDate)
            let exactTime = time[1]
            let postTime = exactTime.slice(0, 6)
            let amPm = exactTime.slice(exactTime.length - 3, exactTime.length)
            // If time ends in a ":" we need to shorten our split.
            if (postTime.slice(-1) === ':') {
                postTime = exactTime.slice(0, 5);
            }
            return postTime + amPm;
        },
        postLikeCount() {
            if (this.originPost.reactions[0] > 0) {
                return this.originPost.reactions[0]
            }
        },
        postLoveCount() {
            if (this.originPost.reactions[1] !== undefined) {
                return this.originPost.reactions[1][1]
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
        }
    },
}
</script>

<style>
/* Main Div */
.post-object-container:hover {
    background-color: rgb(247, 247, 247);
}
.post-object {
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-template-areas: 
        "username date-time"
        "post post" 
        "bottom-btns bottom-btns";
    border-top: solid 1px black; 
    box-shadow: 0px -9px 0px rgba(100, 100, 100, 0.26);
    width: 100%;
    margin-top: 1%;
}



.post-message {
    grid-area: post;
    white-space: pre-wrap;
    margin: 1% 0%;
}
.post-message>img {
    display: block;
    margin: auto;
}


/* Post head (name, date) */
#post-user-name-div {
    grid-area: username;
    justify-self: left;
    display: flex;
    margin-left: 3%;
    height: 40px;
}
.post-user-name {
    font-size: 30;
    font-weight: 700;
}
.header-right {
    display: flex;
    justify-content: right;
    width: 100%;
    white-space: nowrap;
}
/* Post Timestamp */
.date-time {
    grid-area: date-time;
    justify-self: right;
    margin-right: 2%;
    height: 50px;
}
.post-date-time {
    margin-right: 30px;
}


/* Post Body */
#post-body {
    margin: 0px 30px 10px 30px;
}
/* Post Image */
.post-image {
    height: auto;
    width: auto;
    max-width: 100%;
    max-height: 700px;
}




.comments-section {
    font-size: .7em;
    color: red;
    padding: 2px 5px 2px 5px;
    font-weight: bolder;
    height: 100%;
    width: 100%;
}

.post-date {
    color: rgb(99, 98, 98);
    font-weight: 600;
}
.post-footer-buttons {
    width: 2vw;
    height: 2vw;
}

.reaction-count {
    text-align: right;
    margin-top: -7px;
    margin-bottom: 0px;
    font-size: 12px;
}

.emoji-reactions {
    display: flex;
    flex-direction: row;
    height: fit-content;
    width: fit-content;
    padding: 0px;
    margin-right: 10px;
}

.reaction-emoji {
    margin: 0px;
}

.emoji-reaction-area {
    margin-top: 5%;
    padding-left: 2px;
    border: solid 1px black;
    border-radius: 20px;
    background-color:rgb(237, 237, 237);
}

.repost {
    display: flex;
    flex-direction: column;
    margin: 0% 4%;
    border: solid 1px black;
}
.repost-username-div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 30px;
}

.repost-header {
    display: flex;
    width: 100%;
    height: 50px;
    justify-content: space-between;
    align-items: center;
    border-bottom: solid 1px black;
}

.repost-message {
    margin-left: 30px;
}

.repost-date-time {
    display: flex;
    flex-direction: row;
}


</style>