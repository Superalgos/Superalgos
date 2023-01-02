<template>
    <div id="comment-main-div"  
            v-bind="comment.commentID" 
            v-on:mouseover="showBtn = true" 
            v-on:mouseleave="showBtn = false"
            >
        <h6 id="comment-username"> {{comment.username}} </h6>
        <p id="comment-dateTime"> {{comment.dataTime}} </p>
        <p id="comment"> {{comment.comment}} </p>


        <div id="comment-container" 
            v-if="leaveComment === true" >

            <label for="">Reply:</label>

            <textarea 
                name="reply-comment" 
                id="reply-comment" 
                cols="30" 
                rows="10"
                ref="replyComment"
                v-on:keyup.esc="leaveComment = false"
            >
            </textarea>
        </div>



        <div id="reply-btn-div">
            <button id="button" 
                type="button" 
                value=""
                v-on:click="handleReplyClick"
                v-if="showBtn === true"
            >{{leaveComment == false ? 'Reply' : 'Send'}}
            </button>
        </div>

    </div>
</template>

<script>
export default {
    name: 'post-comment',
    props: ['comment'],
    data() {
        return {
            leaveComment: false,
            showBtn: false
        }
    },
    methods: {
        handleReplyClick() {
            if (this.leaveComment === false) {
                this.leaveComment = true;
                this.$nextTick(() => this.$refs.replyComment.focus())
                
            } else {
                this.leaveComment = false;
            }
        },
        setFocus() {
            this.$refs.textArea.focus();
            alert(this.$refs.textArea)
        }
    }

}
</script>

<style>

#comment-main-div {
    border: solid 1.5px black;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 
        "username date-time"
        "comment comment"
        "reply reply"
        "comment-footer comment-footer" ;
    margin: 2% 1%;
    box-shadow: 2px 5px 5px rgba(0,0,0,0.5);
    border-radius: 8px;
}

#comment-username {
    grid-area: username;
    border-bottom: solid 1.5px black;
    padding-left: 10px;
    height: 70%;
}

#comment-dateTime {
    grid-area: date-time;
    text-align: right;
    font-size: .8em;
    padding-right: 10px;
    border-bottom: solid 1.5px black;
    height: 70%;
}

#comment-container {
    grid-area: reply;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 50%;
  font-size: .8em;
}

#reply-comment {
    margin: 1%;
}

#comment {
    grid-area: comment;
    padding-left: 7px;
}

#reply-btn-div {
    grid-area: comment-footer;
    display: flex;
    justify-content: right;
}

button {
  color: black;
  border: solid 1px black;
}

#button {
    border-radius: 3px;
    margin: 1%;
}

</style>