<template>

        <div id="social-app-base-div">
            <div class="background-image-social-trading">
        <div id="social-app-div" class="social-app-grid ">
        
                

            <!-- New Post Area (TOP-MIDDLE) -->
            <div class="new-post-div-flex">
                
                <div id="header-home-btn-div" >
                    <p>Home</p>
                </div>

                <!-- New Post Image & Text Input -->
                <div class="new-post-div">
                    <img class="small-profile-pic" v-bind:src="imageSrc" alt="">
                    <input type="text" name="new-post-input" id="new-post-input" size="75" placeholder="What's happening?" v-model="postBody" >
                </div>
                <!-- New Post Button Bar -->
                <div class="post-btn-bar">
                    <input id="post-submit-btn" type="button" value="Post" v-on:click="sendPost">
                </div>

            </div>
            

            <!-- Menu Div -->
            <div id="menu-tab-social-trading">
                
                <!-- Menu Header Logo -->
                <img class="logo" src="../assets/superalgos-logo-white.png" >

                <!-- Home Menu Button -->
                <p class="social-app-home-btn" 
                        v-on:click="openHomeView()"
                        >
                    Home
                </p>

                <!-- Profile Menu Button -->
                <p class="social-app-home-btn" 
                        @click="openProfile"
                        >
                    Profile
                </p>

                <!-- Profile component -->
                <div v-if="showProfileComponent">
                    <profile />
                </div>
                

                <p class="social-app-home-btn" 
                        @click="openProfile"
                        >
                    My Wallet
                </p>

                <p class="social-app-home-btn" 
                        @click="openProfile"
                        >
                    Settings
                </p>

                
            </div>

            <div class="logout-div">
                <img class="smaller-profile-pic" v-bind:src="imageSrc" alt="">
                <p>{{$store.state.profile.userProfileHandle}}</p>
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
import logo from "../assets/superalgos-logo-white.png"
import store from '../store/index'
import { createPost, getFeed } from '../services/PostService'

export default {
    components: { PostList, NewPost  },
    data() {
        let home = true;
        let newPost = false;
        let postHistory = false;
        let socialFollowersView = false;
        let socialFollowingView = false;
        let walletInfoView = false;
        let socialAppSettingsView = false;
        let postBody = "";
        return {
            nav: [
                home = true,
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
            let message = {
                originSocialPersonaId: this.$store.state.profile.nodeId,
                postText: this.postBody
            }
            createPost(message)
                .then(response => {
                    this.postBody = ''
                    getFeed()
                });
            

        },
        openProfile() {
                store.commit("SHOW_PROFILE", true);
            },
    },
    computed: {
        imageSrc() {
            return this.$store.state.profile.profileImg;
        },
        showProfileComponent() {
                return store.state.showProfile
            },
    }

}
</script>

<style>

.social-app-grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-areas: 
    'left-panel center-panel right-panel';
    width: 100%;
    height: 100%;
}


.small-profile-pic {
    width: 5vw;
    height: 5vw;
    border-radius: 100%;
    margin-top: 9%;
    margin-left: 1%;
    border: solid 2px black;
    align-content: left;
}

.smaller-profile-pic {
    width: 30px;
    height: 30px;
    border-radius: 100%;
    margin-top: 7%;
    margin-left: 1%;
    border: solid 1px black;
    align-content: left;
}



#menu-tab-social-trading {
    grid-area: left-panel;
    display: flex;
    flex-direction: column;
    width: 60%;
    margin-top: 10%;
    justify-self: right;
    margin-right: 5%;
}

.social-trading-menu-btn {
    display: flex;
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    width: 60%;
    height: 3rem;
    font-size: 1.2vw;
    justify-content: center;
    align-content: center;

    margin-left: 15%;
}

.social-trading-menu-btn:hover {
    border: solid 2px black;
    width: 62%;
    font-weight: 500;
}

.social-main-view {
    grid-area: center-panel;
    margin-top: 27%;

    border-left: solid 2px black;
    width: 100%;
}

.logout-div {
    grid-area: left-panel;
    position: fixed;
    bottom: 0%;
    margin-left: 12%;
    display: flex;
    padding: 3px;
}

.logout-div:hover {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    background-color: rgba(182, 182, 182, 0.281);
    width: fit-content;
    cursor: pointer;
}


.social-app-home-btn {
    color: black;
    text-align: center;
    font-size: 1.3vw;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 0px;
    margin-top: 8px;
}

.social-app-home-btn:hover {

    margin-left: 20%;
    margin-right: 20%;
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    background-color: rgba(182, 182, 182, 0.281);
}

#new-post-input {
    height: fit-content;
    margin-top: 10%;
    margin-left: 1%;
    font-size: 18px;
}

.new-post-div-flex {
    grid-area: center-panel;
    display: flex;
    flex-direction: column;
    border-left: solid 2px black;
    border-right: solid 2px black;
}

.post-btn-bar {
    display: flex;
    border-top: solid 1px black;
    border-bottom: solid 1px black;
    margin-top: 1%;
    padding: 5px;
    justify-content: right;
    padding-right: 3%;
}

#post-submit-btn {
    font-size: 1vw;
}

#header-home-btn-div {
    position: fixed;
    width: 49.85%;
    height: auto;
    text-align: center;
    background: rgb(247, 244, 244);
    cursor: pointer;
    font-weight: 600;
    font-size: 1.2vw;
}



</style>