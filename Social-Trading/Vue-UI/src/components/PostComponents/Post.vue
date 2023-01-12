<template>
  <div class="post-object-container" >
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
      <img :src="postImage" alt="">
    </div>

    
    
      


        


      <div id="footer">

        <div class="post-footer">
          <div id="" class="">
            <a href="#"
              class="comments-section"
              style="text-decoration:none"
                v-on:click="getComments(posts.post)"
                v-on:click.left="hasComment === true ? hasComment = false : hasComment = true"
                >  Comments 
            </a>

            <a href="#"
              id="post-likes"
              class="comments-section"
              style="text-decoration:none"
                
                >  Likes
            </a>

          </div>
        
          <div id="comment-btn" class="">
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





export default {
  components: { },
    name: 'post-object',
    props: ['timestamp', 'userHandle', 'postBody', 'postImage'],
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
      }
    },
    methods: {
      
    },
    data() {
      return {
        postDate: undefined,
        postTime: undefined
      }
    },
    
}
</script>

<style>


.post-object {
    display: grid;
    grid-template-columns: 1fr 1fr;
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

#post-body {
    margin: 0px 30px 10px 30px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
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

</style>