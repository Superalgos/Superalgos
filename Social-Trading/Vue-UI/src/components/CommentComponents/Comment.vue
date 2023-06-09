<template>
    <!-- This is a comment on a post -->
    <div id="post-comment-main-div">

        <div id="comment-top-div">
            <div id="comment-name-date-div">
                <p id="post-user-name"> {{userHandle}} </p>
                <p id="post-date"> &nbsp; &#9702; {{postDate}} </p>
            </div>
            <div class="date-time">
            <p id="post-date-time">{{formatTimestamp}}</p>
            </div>
        </div>

        <div class="post-message">
            <p id="post-body">{{postBody}}</p>
            <img :src="postImage" alt="">
        </div>

    </div>
</template>

<script>
export default {
    name: 'post-comment',
    props: ['timestamp', 'userHandle', 'postBody', 'postImage', 'originPostHash', 'originPost', 'eventType'],
    data() {
        return {
            commentBody: '',
            postDate: undefined
        }
    },
    methods: {
        
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
        }
    }
}
</script>

<style>

#post-comment-main-div {
    border-bottom: solid 1px black;
    display: flex;
    flex-direction: column;
}

#post-user-name {
    font-weight: 600;
}

#comment-top-div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0% 2% 0% 2%;
}

#comment-name-date-div {
    display: flex;
    flex-direction: row;
}

</style>