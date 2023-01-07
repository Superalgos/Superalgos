<template>

        <div id="social-app-base-div">
            <div class="background-image-social-trading">
        <div id="social-app-div" class="social-app-grid ">
        
            <div class="profile-component-div">
                <img class="small-profile-pic" v-bind:src="imageSrc" alt="">
                <p>{{$store.state.profile.userProfileHandle}}</p>
            </div>

            <div id="menu-tab-social-trading">

                <input id="social-app-home-btn" 
                        class="social-trading-menu-btn" 
                        type="button" 
                        value="Home"
                        v-on:click="openHomeView()"
                        >

                <input id="new-post-btn"
                        class="social-trading-menu-btn" 
                        type="button" 
                        value="New Post"
                        v-on:click="openNewPostView()"
                        >

                <input id="post-history-btn"
                        class="social-trading-menu-btn" 
                        type="button" 
                        value="Post History"
                        v-on:click="openPostHistoryView()"
                        >

                <input id="social-followers-btn"
                        class="social-trading-menu-btn" 
                        type="button" 
                        value="Follower's"
                        v-on:click="openSocialFollowersView()"
                        >

                <input id="social-following-btn"
                        class="social-trading-menu-btn" 
                        type="button" 
                        value="Following"
                        v-on:click="openSocialFolloweringView()"
                        >

                <input id="social-app-settings-btn"
                        class="social-trading-menu-btn" 
                        type="button" 
                        value="Social App Settings"
                        v-on:click="openSocialSettingsView()"
                        >
            </div>


            <div id="home-view-main" 
                    class="social-main-view content-container" 
                    v-if="this.nav[0] == true"
                >
                    <div id="post-list-container">
                        <post-list id="post-list" />
                    </div>
            </div>

            <new-post v-if="this.nav[1] == true" />

            <div id="social-app-post-history-div"
                    class="content-container"
                    v-if="this.nav[2] == true"
                    >
                    ###Search option here to search the post history by: user, date, keyword
            </div>

            <div id="social-app-followers-view"
                    v-if="this.nav[3] == true"
                    class="content-container"
                    >
                <div id="followers-count-div">
                    <p id="total-followers" class="social-app-followers ">Total Followers: {{this.$store.state.followers.length}} </p>
                </div>

                <div id="followers-array-div"
                        >

                        <div id="followers-div"
                                class="followers"
                                v-for="follower in this.$store.state.followers"
                                v-bind:key="follower.username"
                            >
                            {{follower.username}}
                        </div>
                        
                </div>

            </div>


            <div id="social-app-following-view"
                    v-if="this.nav[4] == true"
            >
            <div id="following-count-div">
                <p id="total-following" class="social-app-following">Total Following: {{this.$store.state.following.length}} </p>
            </div>

            <div id="following-array-div"
            >

            <div id="following-div"
                    class="following"
                    v-for="follow in this.$store.state.following"
                    v-bind:key="follow.username"
            >
            {{follow.username}}
            </div>
                        
        </div>

            </div>


            <div id="social-app-settings-div"
                    class="social-main-view"
                    v-if="this.nav[5] == true"
                    >
            </div>

</div>
        </div>
        </div>

</template>

<script>
import NewPost from '../components/PostComponents/NewPost.vue';
import PostList from '../components/PostComponents/PostList.vue';
import { getFeed } from '../services/PostService'

export default {
    components: { PostList, NewPost  },
    data() {
        let home = false;
        let newPost = false;
        let postHistory = false;
        let socialFollowersView = false;
        let socialFollowingView = false;
        let walletInfoView = false;
        let socialAppSettingsView = false;
        let postBody = "";
        return {
            nav: [
                home = false,
                newPost = false,
                postHistory = false,
                socialFollowersView = false,
                socialFollowingView = false,
                walletInfoView = false,
                socialAppSettingsView = false
            ],
            postBody: '',
        }
    },
    methods: {
        closeAll() {
            let newNav = this.nav;
            for (let i = 0; i < newNav.length; i++) {
                let btn = newNav[i]
                if (btn !== false) {
                    newNav[i] = false;
                }
            }
            this.nav = newNav;
        },
        openHomeView() {
            this.closeAll()
            this.nav[0] = true;
        },
        openNewPostView() {
            this.closeAll()
            this.nav[1] = true;
        },
        openPostHistoryView() {
            this.closeAll()
            this.nav[2] = true;
        },
        openSocialFollowersView() {
            this.closeAll()
            this.nav[3] = true;
        },
        openSocialFolloweringView() {
            this.closeAll()
            this.nav[4] = true;
        },
        openSocialSettingsView() {
            this.closeAll()
            this.nav[5] = true;
        },
        
        bounceBtn() {
            let item = this.classList
            console.log(item)
        },

        sendPost() {
            sendNewPost(this.postBody)
            return getAllPosts()
                .then(response => {
                    console.log(response)
                    return response
                })

        }
    },
    computed: {
        imageSrc() {
            return this.$store.state.profile.profileImg;
        },
    }

}
</script>

<style>

.social-app-grid {
    display: grid;
    grid-template-columns: 1fr 4fr;
    grid-template-areas: 
    'profile-component profile-data'
    'nav-buttons profile-data';
    width: 100%;
    height: 100%;
}

.background-image-social-trading {
    display: flex;
    height: 100%;
    width: 100%;
    background-image: url(https://superalgos.org/img/photos/supermind-original.jpg);
    animation: slide 20s linear infinite;
    
}

@keyframes slide {
    0%{background-position-x: left(0); background-position-y: top(0);}
    25%{background-position-x: left(50); background-position-y: top(100);}
    50%{background-position-x: left(100); background-position-y: top(200);}
    75%{background-position-x: left(150); background-position-y: top(300);}
	100%{background-position-x: left(250); background-position-y: top(400);}
}


#social-app-base-div {
    
    align-content: top;
    border: solid 2px black;
    border-radius: 8px;

    height: 100vh;
    width:  98%;
    align-self: start;
    min-height: 300px;
    box-shadow: 0px 2px 10px 4px rgb(44, 44, 44);
}

.small-profile-pic {
    width: 15vw;
    height: 15vw;
    border-radius: 100%;
    margin-top: 4%;
    border: solid 2px black;
}

.profile-component-div {
    grid-area: profile-component;
    background: rgb(228, 220, 209) 100%;
    box-shadow: 0px 2px 10px 4px rgba(245, 242, 242, .4);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 1%;
    margin-top: 1%;
    width: 100%;
    border-left: solid 3px black;
    border-top: solid 3px black;
    border-right: solid 3px black;
    position: relative;
}

#menu-tab-social-trading {
    grid-area: nav-buttons;
    display: flex;
    flex-direction: column;
    justify-content: top;
    height: 50vh;
    width: 100%;
    background: rgb(228, 220, 209) 100%;
    box-shadow: 0px 2px 10px 4px rgba(245, 242, 242, .4);
    margin-left: 1%;
    margin-bottom: 2%;
    border-right: solid 3px black;
    border-left: solid 3px black;
    border-bottom: solid 3px black;
    position: relative;
}

.social-trading-menu-btn {
    background: rgb(228, 220, 209);
    border: solid 2px black;
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    width: 88%;
    height: 3rem;
    align-self: center;
    text-align: center;
    font-size: 1.2vw;

    box-shadow: 0px 2px 10px 4px rgba(245, 242, 242, .4);
}

.social-trading-menu-btn:hover {
    border: solid 2px black;
    width: 92%;
    font-weight: 500;
}

.social-main-view {
    grid-area: profile-data;
}

.content-container {
    display: flex;
    height: 90%;
    width: 98%;
    overflow: auto;
    align-self: center;
    background: rgba(228, 220, 209, 0.589);
    box-shadow: 0px 2px 10px 4px rgba(245, 242, 242, .4);
    margin-left: 1vw;
    border: solid 2px black;
    border-radius: 20px;
}

.social-app-followers-view {
    grid-area: profile-data;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas: 
    'total-followers'
    'followers'
    'followers'
    'followers';
    margin-right: 1vw;
    margin-left: 1vw;
    margin-bottom: 1em;
    margin-top: 1em;
    align-self: center;
    height: 85%;
}

#followers-count-div {
    grid-area: total-followers;
    margin-top: 1vh;
    height: 40%;
    width: 20vw;
    align-self: top;
    justify-self: center;
}

.social-app-followers {
    background: rgb(228, 220, 209) 100%;
    border: solid 3.5px black;
    border-radius: 20px;
    box-shadow: 0px 2px 10px 4px rgba(245, 242, 242, .4);
}

.followers:hover {
    cursor: pointer;
    position: inherit;
    animation: pulse 1.8s infinite ease-in-out alternate;
}

#total-followers {
    grid-area: followers;
    display: flex;
    font-size: 2em;
    justify-content: center;
    align-content: center;
}

#followers-array-div {
    display: flex;
    flex-wrap: wrap;
   
}





#following-count-div {
    grid-area: total-following;
    margin-top: 1vh;
    height: 40%;
    width: 20vw;
    align-self: top;
    justify-self: center;
}

.social-app-following {
    background: rgb(228, 220, 209) 100%;
    border: solid 3.5px black;
    border-radius: 20px;
    box-shadow: 0px 2px 10px 4px rgba(245, 242, 242, .4);
}

.following {
    background: rgb(228, 220, 209) 100%;
    border: solid 3.5px black;
    border-radius: 20px;
    box-shadow: 0px 2px 10px 4px rgba(245, 242, 242, .4);
}

.following:hover {
    cursor: pointer;
    position: inherit;
    animation: pulse 1.8s infinite ease-in-out alternate;
}

#total-following {
    grid-area: following;
    display: flex;
    font-size: 2em;
    justify-content: center;
    align-content: center;
}

#following-array-div {
    display: flex;
    flex-wrap: wrap;
   
}





@keyframes pulse {
  from { transform: scale(0.9); }
  to { transform: scale(1.1); }
}




#social-app-post-history-div {
    height: 85%;
}
</style>