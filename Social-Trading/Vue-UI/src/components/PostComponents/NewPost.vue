<template>

    <div id="social-new-post-div"
        class="social-main-view content-container"
    >
        <div id="social-app-new-post-body">
            <div id="social-app-username-div" class="username">
                <p>{{$store.state.profile.userProfileHandle}}</p>
            </div>

            <div class="date-time">
                {{getCurrentDateTime}}
            </div>

            <div id="social-app-new-post-message" class="post-message">

            <textarea name="" id="social-app-post-textarea" cols="30" rows="10" v-model="postBody">
            </textarea>

            <div id="submit-post-btn-div">
                <input id="submit-post-btn" type="button" value="Send Post" v-on:click="sendPost">
            </div>
        </div>
                        
        </div>
    </div>
                    
</template>

<script>

// import { createPost } from '../../services/PostService'
import store from '../../store/index'

export default {
    name: 'new-post',
    data() {
    return {
            postBody: undefined
        };
    },
    methods: {
        sendPost() {
            let message = {
                originSocialPersonaId: this.$store.state.profile.nodeId,
                postText: this.postBody,
                postImage: store.state.postImage
            }
            // createPost(message)

        }
    },
    computed: {
        getCurrentDateTime() {
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate();
            const year = currentDate.getFullYear();
            let hours = currentDate.getHours();
            let minutes = currentDate.getMinutes();
            let ampm = "am";

            if (hours > 12) {
                hours -= 12;
                ampm = "pm";
            }

            if (minutes < 10) {
                minutes = `0${minutes}`;
            }

            return `${month}-${day}-${year} ${hours}:${minutes}${ampm}`;
        }
}
}
</script>

<style>

#post-list {
    width: 90%;
    padding-right: 50px;
}

#social-app-new-post-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 
        "username date-time"
        "post post"
        "reply reply" ;
    border-top: solid 2px black; 
    background: rgb(231, 227, 227);
    box-shadow: 0px -3px 10px 0.5px rgba(0,0,0,0.4);
    border-radius: 10px;
    width: 95%;
    height: auto;
    margin: 2vh;
}

#social-app-username-div {
    height: 5vh;
}

#social-app-new-post-message {
    height: 49vh;
}

#social-app-post-textarea {
    width: 100%;
    height: 88%;
    border-radius: 12px;
}

#submit-post-btn-div {
    display: flex;
    justify-content: right;
}

#social-new-post-div {
    height: auto;
    align-self: center;
}

#submit-post-btn {
    display: flex;
    grid-area: reply;
    justify-self: center;
    font-size: 2.5vh;
}

</style>