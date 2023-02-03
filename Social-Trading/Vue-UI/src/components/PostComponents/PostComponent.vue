<template>
    <div :id="id" class="post-object-container" >
        <div class="post-object">
            <div id="post-user-name-div">
                <p id="post-user-name"> {{this.userName}} </p>
                <p id="post-date"> &nbsp; &#9702; {{this.postDate}} </p>
            </div>
            <div class="date-time">
                <p id="post-date-time">{{formatTimestamp}}</p>
            </div>
            <div class="post-message">
                <p id="post-body">{{postBody}}</p>
                <img class="post-image" :src="postImage" alt="">
            </div>
        </div>
    </div>
</template>

<script>
export default {
  components: { },
    name: 'post-component',
    props: ['timestamp', 'userName', 'postBody', 'postImage', 'originPostHash', 'id', 'reactions', 'originSocialPersonaId'],
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
            //console.log(this.originPost.reactions)
            return this.originPost.reactions[0]
            }
        },
        postLoveCount() {
            //console.log(this.originPost.reactions)
            if (this.originPost.reactions[1] !== undefined) {
            return this.originPost.reactions[1][1]
            }
        },
        emojiReactionReady() {
            if (store.state.emojiReactionKey !== undefined) {
            return true;
            } else {
            return false;
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
#post-user-name {
    font-size: 30;
    font-weight: 700;
}
/* Post Timestamp */
.date-time {
    grid-area: date-time;
    justify-self: right;
    margin-right: 2%;
    height: fit-content;
}
#post-date-time {
    text-align: bottom;
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

#post-date {
    color: rgb(99, 98, 98);
    font-weight: 600;
}
.post-footer-buttons {
    width: 2vw;
    height: 2vw;
}






</style>