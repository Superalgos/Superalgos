<template>
  <div class="post-object" v-bind:posts="{ id: posts.postID}" >

    <div class="username">
      <h4 id="username" > {{posts.post.username}} </h4>
    </div>

    
    <div class="date-time">
      <h5 id="post-date-time">{{posts.post.dateTime}}</h5>
    </div>
    
    <div 
      v-if="this.$store.state.newPost === false" 
      class="post-message">
      <p id="post-body">{{posts.post.message}}</p>


        <div id="post-comments-section" >
        </div>


      <div id="footer">
        

        <div id="comment-container" 
          v-if="leaveComment === true" >

          <label for="">Comment:</label>

          <textarea 
            name="comment" 
            id="comment" 
            cols="30" 
            rows="10"
            ref="newComment"
            v-on:keyup.esc="leaveComment = false"
            >
          </textarea>
          
        </div>


        <div id="show-comments" 
              v-if="showComments === true && hasComment === true">

          <div id="comment-div" v-for="comment in commentArray" v-bind:key="comment"  >

          <comment v-bind:comment="comment" />

            

            
            
          </div>
              <p > {{comment}} </p>
        </div>


        <div class="post-footer">
          <div id="post-stats" class="post-footer">
            <a href="#"
              class="comments-section"
              style="text-decoration:none"
                v-show="posts.post.comments.length >= 0 "
                v-on:click="getComments(posts.post)"
                v-on:click.left="hasComment === true ? hasComment = false : hasComment = true"
                > {{posts.post.comments.length}} Comments 
            </a>

            <a href="#"
              id="post-likes"
              class="comments-section"
              style="text-decoration:none"
                v-show="posts.post.likes.length >= 0"
                > {{posts.post.likes.length}} Likes
            </a>

          </div>
        
          <div id="comment-btn" class="post-footer comments-section">
            <input type="button" 
                    value="Comment" 
                    v-on:click="focusComment" 
                    v-bind="leaveComment"
                    v-if="leaveComment === false" >

            <input type="button" 
                  value="    &#10149;    "
                  id="post-comment-button"
                  style='font-size:25px;'
                  v-on:click=" leaveComment = false "
                  v-if="leaveComment === true"
                  >
          </div>

          
        
          
        </div>

      </div>

    </div>


    
    
  </div>
</template>

<script>
import Comment from './Comment.vue'



//import GithubStorage from '../services/GithubStorage.js'



export default {
  components: {Comment  },
    name: 'post-object',
    props: {
      posts: {
        type: Object
      }
    },
    computed: {
      computeComments() {
        console.log(posts.comment)
        if (post.comments.length > 0) {
          this.hasComment = true
          return commentList = post.comments.filter((value, index) => {
            console.log(value)
          })
        } else {
          this.hasComment = false
        }
      }
    },
    methods: {
      getComments(post) {
        if (post.comments.length > 0 && post.comments.length > this.commentArray.length) {

          for (let i = 0; i < post.comments.length; i++) {
          let thisComment = post.comments[i]
          this.commentArray.unshift(thisComment)
          }
          return this.commentArray
        } else {
          console.log("false")
        }
        
      },
      focusComment() {
        this.leaveComment = true
        this.$nextTick(() => this.$refs.newComment.focus())
      }
    },
    data() {
      return {
        leaveComment: false,
        showComments: true,
        hasComment: false,
        lastCommentID: 0,
        lastPostID: 0,
        commentArray: []
      }
    }
    // created() {
    //   GithubStorage
    //     .getPost()
    //     .then(response => {
    //       let responseData = response.data.posts
    //       //We will send each post to the store state for use.
    //       responseData.forEach((value, index) => {
    //         let thisPost = value.post
    //         this.post.id = value.postID
    //         this.post.datetime = thisPost.dateTime
    //         this.post.username = thisPost.username
    //         this.post.message = thisPost.message

    //         this.$store.commit('ADD_POST', this.post);

    //         this.post.id = 0;
    //         this.post.username = '';
    //         this.post.datetime = '';
    //         this.post.message = '';
            
    //       });
    //     });
    // }
}
</script>

<style>

.post-object {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 
        "username date-time"
        "post post" ;
    border-top: solid 2px black; 
    background: rgb(231, 227, 227);
    box-shadow: 0px -3px 10px 0.5px rgba(0,0,0,0.4);
    border-radius: 10px;
    width: 98%;
    margin: 2vh;
}

.username {
    grid-area: username;
    justify-self: left;
    padding: 7px;
    border-left: solid 2px black;
    border-top-left-radius: 10px;
}

#username {
    font-size: 22px;
}

.date-time {
    grid-area: date-time;
    justify-self: right;
    padding: 7px 10px 2px 7px;
    border-right: solid 2px black;
    border-top-right-radius: 10px;
}

#post-date-time {
    font-size: 15px;
    text-align: bottom;
    padding: 5px;
}

.post-message {
    grid-area: post;
    border-right: solid 2px black;
    border-left: solid 2px black;
    border-bottom: solid 2px black;
    border-top: solid 1px black;
    padding: 7px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
}

#post-body {
    margin: 10px 10px 20px 10px;
    font-size: 14px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

#comment-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100%;
  font-size: .8em;
}

#comment {
  display: flex;
  flex-wrap: wrap;
}

#post-comment-button {
  margin-top: .5em;
  justify-items: right;
}

.comments-section {
  font-size: .7em;
  color: red;
  padding: 2px 5px 2px 5px;
  font-weight: bolder;
}

#post-stats {
  justify-self: center;
}

#comment-btn {
  display: flex;
  justify-content: right;
}

</style>