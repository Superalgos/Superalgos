<template>
  <div class="post-object-container" >
  <div class="post-object" >

    <div id="post-user-name-div">
      <p id="post-user-name"> {{userHandle}} </p>
    </div>

    
    <div class="date-time">
      <p id="post-date-time">{{formatTimestamp}}</p>
    </div>

    <div class="post-message">
      <p id="post-body">{{postBody}}</p>
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
    props: ['timestamp', 'userHandle', 'postBody'],
    computed: {
      formatTimestamp() {
        const date = new Date(this.timestamp);
        let timeString = date.toLocaleString();
        // We remove the seconds from the time.
        let time = timeString.split(',')
        let postDate = time[0]
        let exactTime = time[1]
        let postTime = exactTime.slice(0, 6)
        let amPm = exactTime.slice(exactTime.length - 3, exactTime.length)
        // If time ends in a ":" we need to shorten our split.
        if (postTime.slice(-1) === ':') {
          postTime = exactTime.slice(0, 5);
        }
        

        return postDate + postTime + amPm;
      }
    },
    methods: {
      
    },
    data() {
      return {
        
      }
    },
    
}
</script>

<style>

.post-object-container {
  display: flex;
  justify-items: center;
  width: 100%;

}

.post-object {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 
        "username date-time"
        "post post" 
        "bottom-btns bottom-btns";
    border-top: solid 2px black; 
    background: rgb(231, 227, 227);
    box-shadow: 0px -3px 10px 0.5px rgba(0,0,0,0.4);
    border-radius: 10px;
    width: 100%;
    margin: 2vh;
}

#post-user-name-div {
    grid-area: username;
    justify-self: left;
    border-left: solid 2px black;
    border-top-left-radius: 10px;
}

#post-user-name {
  font-size: 30;
}

#username {
  

}

.date-time {
    grid-area: date-time;
    justify-self: right;

    border-right: solid 2px black;
    border-top-right-radius: 10px;

}

#post-date-time {

    text-align: bottom;

}

.post-message {
    grid-area: post;
    border-right: solid 2px black;
    border-left: solid 2px black;
    border-bottom: solid 1px black;
    border-top: solid 1px black;
    padding: 7px;

}

#post-body {
    margin: 10px 10px 20px 10px;

    
}

.post-footer {
  display: flex;
  justify-content: space-between;
  border-bottom: solid 2px black;
  border-right: solid 2px black;
  border-left: solid 2px black;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}


.comments-section {
  
  font-size: .7em;
  color: red;
  padding: 2px 5px 2px 5px;
  font-weight: bolder;
  height: 100%;
  width: 100%;
}

#post-stats {
  justify-self: center;
}

#comment-btn {
  display: flex;
  justify-content: right;
  
}

#footer {
  grid-area: bottom-btns;
}

</style>