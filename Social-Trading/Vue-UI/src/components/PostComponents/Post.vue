<template>
  <!-- We filter out all none posts in the post array in the below v-if -->
  <div class="post-object-container" v-if="eventType === 10" >
  <div class="post-object" >

    <div id="post-user-name-div">
      <p id="post-user-name"> {{userHandle}} </p>
      <p id="post-date"> &nbsp; &#9702; {{this.postDate}} </p>
    </div>

    
    <div class="date-time">
      <p id="post-date-time">{{formatTimestamp}}</p>
    </div>

    <div class="post-message">
      <p id="post-body">{{postBody}}</p>
      <img class="post-image" :src="postImage" alt="">
    </div>


      <div id="footer">

        <div class="">
          <div id="" class="post-footer">
            <!-- Comment Post Button -->
            <p class="post-comments-button"       v-on:click="openPostComments" v-if="!$store.state.showPostComments">
              <img src="../../assets/iconmonstrCommentIcon.png" alt="Comment" class="post-footer-buttons">
              &nbsp;&nbsp;  <strong> {{commentCount}} </strong>
            </p>
            <!-- Like Post Button -->
            <p class="post-comments-button"       v-on:click="likeThisPost">
              <img src="../../assets/iconmonstrLikeIcon.png" alt="Comment" class="post-footer-buttons">
              &nbsp;&nbsp; <strong> {{originPost.reactions[0][1]}} </strong>
            </p>
            <!-- Love Post Button -->
            <p class="post-comments-button"       v-on:click="loveThisPost">
              <img src="../../assets/iconmonstrHeartIcon.png" alt="Comment" class="post-footer-buttons">
              &nbsp;&nbsp; <strong> {{this.originPost.reactions[1][1]}} </strong>
            </p>
            <!-- React to Post Button -->
            <p class="post-comments-button"       v-on:click="openPostComments">
              <img src="../../assets/iconmonstrEmojiIcon.png" alt="Comment" class="post-footer-buttons">
              &nbsp;
            </p>
            <!-- Repost Post Button -->
            <p class="post-comments-button"       v-on:click="openPostComments">
              <img src="../../assets/iconmonstrRepostIcon.png" alt="Comment" class="post-footer-buttons">
              &nbsp;Repost
            </p>
          </div>
        </div>
    </div>
  </div>
</div>
</template>

<script>
import store from '../../store/index'
import { reactedPost, getReplies } from '../../services/PostService'
import { getProfileData } from '../../services/ProfileService'

export default {
  components: { },
    name: 'post-object',
    props: ['timestamp', 'userHandle', 'postBody', 'postImage', 'originPostHash', 'originPost', 'commentCount', 'eventType'],
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
        console.log(this.originPost.reactions)
        if (this.originPost.reactions[1] !== undefined) {
          return this.originPost.reactions[1][1]
        }
      },
    },
    methods: {
        openPostComments() {
          console.log(this.originPost)
          // Prepare our props to send to the store.
          let postProps = {
                timestamp: this.timestamp,
                userHandle: this.userHandle,
                postBody: this.postBody,
                postImage: this.postImage,
                originPostHash: this.originPostHash,
                originPost: this.originPost,
                commentCount: this.commentCount,
                eventType: this.eventType
              }

          store.commit("SET_POST_COMMENT_PROPS", postProps);
          store.commit("SHOW_POSTS_COMMENTS", true);

          // Then we retrieve the comments for this post.
          let message = {
                originSocialPersonaId: this.originPost.originSocialPersonaId,
                originPostHash: this.originPostHash
            }
            // Then we fetch the comments for this post.
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
                  // We send the postComments array to the store for use in a different component.
                  store.commit("SET_POST_COMMENTS_ARRAY", postComments);
                  }
                  // Finally we need to load the user profile that created the post.
                  getProfileData(message)
                    .then(dataResponse => {
                    
                    let headerProfileData = dataResponse.data
                    store.commit("SET_HEADER_PROFILE_DATA", headerProfileData)
                  });
              });
        },
        likeThisPost() {
            let message = {
                originSocialPersonaId: store.state.profile.nodeId,
                targetSocialPersonaId: this.originPost.originSocialPersonaId,
                postHash: this.originPostHash,
                eventType: 100,
            }
            reactedPost(message)
            .then(response => {
              console.log(response)
              if (this.likedPost !== true) {
                this.originPost.reactions[0][1] += 1;
                this.likedPost = true;
              } else {
                this.originPost.reactions[0][1] -= 1;
                this.likedPost = false;
              }
              
            });
        },
        loveThisPost() {
          let message = {
                originSocialPersonaId: store.state.profile.nodeId,
                targetSocialPersonaId: this.originPost.originSocialPersonaId,
                postHash: this.originPostHash,
                eventType: 101,
            }
            reactedPost(message)
            .then(response => {
              console.log(response)
              if (this.lovedPost !== true) {
                this.originPost.reactions[1][1] += 1;
                this.lovedPost = true;
              } else {
                this.originPost.reactions[1][1] -= 1;
                this.lovedPost = false;
              }
            });
        }
      
    },
    data() {
      return {
        postDate: undefined,
        postTime: undefined,
        likedPost: false,
        lovedPost: false
      }
    },
    
}
</script>

<style>


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

.post-object:hover {
  background-color: rgb(247, 247, 247);
  cursor: pointer;
}

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


.date-time {
    grid-area: date-time;
    justify-self: right;
    margin-right: 2%;
    height: fit-content;
}

#post-date-time {
    text-align: bottom;
}

.post-message {
    grid-area: post;
    white-space: pre-wrap;
}

.post-message>img {
  display: block;
  margin: auto;
}

#post-body {
    margin: 0px 30px 10px 30px;
}

.post-footer {
  display: flex;
  justify-content: space-around;
  border-bottom: solid 1px black;
}


.comments-section {
  font-size: .7em;
  color: red;
  padding: 2px 5px 2px 5px;
  font-weight: bolder;
  height: 100%;
  width: 100%;
}


#footer {
  grid-area: bottom-btns;
}

#post-date {
  color: rgb(99, 98, 98);
  font-weight: 600;
}

.post-comments-button {
  display: flex;
  align-items: center;
  padding: 0.75% 1%;
  white-space: hide;
  font-size: 1vw;
}

.post-comments-button:hover {
  border-radius: 30px;
  background-color: rgba(182, 182, 182, 0.281);
  padding: 0% 1%;
}

.post-footer-buttons {
  width: 2vw;
  height: 2vw;
}

.post-image {
  height: auto;
  width: auto;
  max-width: 100%;
  max-height: 700px;

}

</style>