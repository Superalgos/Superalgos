<template>

        <div id="social-app-base-div">
            <div class="background-image-social-trading">
        <div id="social-app-div" class="social-app-grid ">
        
            <!-- New Post Area (TOP-MIDDLE) -->
            <div class="new-post-div-flex">
                <!-- Fixed top menu button -->
                <div id="header-home-btn-div" v-on:click="scrollUp" >
                    <p>Home</p>
                </div>

                <!-- New Post Image & Text Input -->
                <div class="new-post-div">
                    <img class="small-profile-pic" v-bind:src="imageSrc" alt="">
                    <input type="text" name="new-post-input" id="new-post-input" size="50" placeholder="What's happening?" v-model="postBody" @change="updatePostBody" >
                </div>

                <!-- New Post Button Bar -->
                <div class="post-btn-bar">
                    <!-- Add to post Icons -->
                    <div id="add-to-post-icons">
                        <img src="../assets/iconmonstrImageIcon.png" alt="Add Image" class="button-bar-icon" v-on:click="toggleUploadImage">
                        <img src="../assets/iconmonstrEmojiIcon.png" alt="Add Image" class="button-bar-icon" v-on:click="showEmojiPicker" >
                    </div>
                    <div id="emoji-component" v-if="getEmojiPicker" >
                            <emoji-picker />
                    </div>
                    <!-- Submit Post Button -->
                    <div id="submit-btn-div">
                        <input id="post-submit-btn" type="button" value="Post" v-on:click="sendPost">
                    </div>
                </div>
            </div>

            <!-- Menu Div -->
            <div id="menu-tab-social-trading">
                <!-- Menu Header Logo -->
                <div id="menu-head-logo-div">
                    <img class="logo" src="../assets/superalgos-logo.png" >
                </div>
                <div class="menu-btns-div">
                <!-- Home Menu Button -->
                <div class="social-app-home-btn">
                <p class="menu-btn-text"  
                        v-on:click="openFeed"
                        >
                        <img src="../assets/iconmonstrHomeIcon.png" alt="Home Menu Icon" class="menu-icon">
                    &nbsp;Home
                </p>
                </div>
                <!-- Profile Menu Button -->
                <div class="social-app-home-btn">
                    <p class="menu-btn-text" 
                            @click="openProfile"
                            >
                            <img src="../assets/iconmonstrProfileIcon.png" alt="Profile Menu Icon" class="menu-icon">
                        &nbsp;Profile
                    </p>
                </div>
                <!-- Profile component -->
                <div v-if="showProfileComponent">
                    <profile-panel />
                </div>
                <!-- Wallet Menu Button -->
                <div class="social-app-home-btn">
                <p class="menu-btn-text" 
                        @click="openWalletPanel"
                        >
                        <img src="../assets/iconmonstrWalletIcon.png" alt="Profile Menu Icon" class="menu-icon">
                    &nbsp;Wallet
                </p>
                </div>
                <!-- Wallet Component -->
                <div v-if="showWalletComponent">
                    <wallet-panel />
                </div>
                <!-- Settings Menu Button -->
                <div class="social-app-home-btn">
                    <p class="menu-btn-text" 
                            @click="openSettingsPanel"
                            >
                            <img src="../assets/iconmonstrSettingsIcon.png" alt="Settings Menu Icon" class="menu-icon">
                        &nbsp;Settings
                    </p>
                </div>
                <!-- Settings Component -->
                <div v-if="showSettingsComponent">
                    <settings-panel />
                </div>
            </div>
        </div>

            <!-- Logout Div (bottom left) -->
            <div class="logout-div">
                <img class="smaller-profile-pic" v-bind:src="imageSrc" alt="">
                &nbsp;
                <p>{{$store.state.profile.userProfileHandle}}</p>
                <img src="../assets/iconmonstrHorizontalMenuIcon.png" alt="Add Image" class="logout-div-menu-icon">
            </div>

            <!-- Posts are here -->
            <div id="home-view-main" 
                    class="social-main-view content-container" 
                    v-if="this.nav[0] == true"
                >
                    <!-- Post-List Component -->
                    <div id="post-list-container">
                        <post-list id="post-list" />
                    </div>
                    <!-- Temp Refresh Needed Message -->
                    <p class="center" v-if="$store.state.posts.length == 0">Refresh the webpage once network node connects to retrieve posts.</p>
            </div>

            <!-- Follow Panel -->
            <div>
                <follow-panel />
            </div>
            <!-- Image Uploader Component -->
            <div>
                <upload-image-panel />
            </div>
            

        </div>
    </div>
</div>

</template>

<script>
import PostList from '../components/PostComponents/PostList.vue';
import store from '../store/index'
import { createPost, getFeed } from '../services/PostService'
import FollowPanel from '../components/FollowComponents/FollowPanel.vue';
import WalletPanel from '../components/WalletComponents/WalletPanel.vue';
import SettingsPanel from '../components/SettingsComponents/SettingsPanel.vue';
import ProfilePanel from '../components/ProfileComponents/ProfilePanel.vue'
import EmojiPicker from '../components/PostComponents/EmojiPicker.vue';
import UploadImagePanel from '../components/UploaderComponents/UploadImagePanel.vue'

export default {
    components: { PostList, FollowPanel, WalletPanel, SettingsPanel, ProfilePanel, EmojiPicker, UploadImagePanel  },
    data() {
        let home = true;
        let profile = false;
        let wallet = false;
        let settings = false;
        let postBody = "";
        return {
            nav: [
                home = true,
                profile = false,
                wallet = false,
                settings = false
            ],
            postBody: '',
        }
    },
    methods: {
        sendPost() {
            let message = {
                originSocialPersonaId: this.$store.state.profile.nodeId,
                postText: this.postBody
            }
            // If the post is not empty we will send it.
            if (message.postText !== '') {
            createPost(message)
                .then(response => {
                    this.postBody = ''
                    getFeed()
                });
            }
        },
        openProfile() {
            store.commit("SHOW_PROFILE", true);
        },
        openWalletPanel() {
            store.commit("SHOW_WALLET", true);
        },
        openSettingsPanel() {
            store.commit("SHOW_SETTINGS", true);
        },
        scrollUp() {
            window.scrollTo(window.innerHeight, 0);
        },
        openFeed() {
            getFeed()
        },
        showEmojiPicker() {
            let isDisplayed = store.state.showEmojiPicker;
            store.commit("SHOW_EMOJI_PICKER", !isDisplayed);
        },
        updatePostBody() {
            console.log(`Message updated: ${this.postBody}`)
        },
        toggleUploadImage() {
            let isDisplayed = store.state.showImageUploader;
            console.log("Image uploader state = " + store.state.showImageUploader)
            store.commit("SHOW_IMAGE_UPLOADER", !isDisplayed);
        }
    },
    computed: {
        imageSrc() {
            return store.state.profile.profileImg;
        },
        showProfileComponent() {
            return store.state.showProfile
        },
        showWalletComponent() {
            return store.state.showWallet
        },
        showSettingsComponent() {
            return store.state.showSettings
        },
        getEmojiPicker() {
            return store.state.showEmojiPicker
        },
        insertEmoji() {
            if(store.state.selectedEmoji !== undefined) {
                this.postBody = this.postBody + store.state.selectedEmoji
                store.commit("RESET_EMOJI");
                // TODO Create a click event on the toggle button to close the emoji panel and update the text displayed.
            }
            return this.postBody
        },
        getPostBody() {
            return this.postBody;
        },
        shouldUpdateImagePanel() {
            return store.state.showImageUploader;
        }
    },
    watch: {
    insertEmoji(newValue, oldValue) {
        // update the text field when the message value changes
        this.$el.querySelector('input').value = this.postBody
    }
  }

}
</script>

<style>
/* __________________
    Main Div
*/
.social-app-grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-areas: 
    'left-panel center-panel right-panel'
    'left-panel posts right-panel';
    width: 100%;
    height: 100%;
}


/* _________________________
    Menu 
 */
#menu-tab-social-trading {
    grid-area: left-panel;
    

    margin-top: 10%;
    justify-self: right;
    margin-right: 5%;
}
.menu-btns-div {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-items: right;
}
.menu-btn-text {
    display: flex;
    font-size: 25px;
    font-weight: 700;
    align-content: center;
    padding-left: 20px;
    padding-right: 20px;
}
.menu-btn-text:hover {
    padding-left: 20px;
    padding-right: 20px;
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    background-color: rgba(182, 182, 182, 0.281);
}
.menu-icon {
    width: 30px;
    height: 30px;
    align-self: center;
    margin-right: 10px;
}
.social-app-home-btn {
    display: flex;
    color: black;
    cursor: pointer;
    margin-bottom: 0px;
    margin-top: 8px;
    justify-content: left;
    align-items: center;

    height: 50px;
    width: 100%;
}
.logo {
        height: 60px;
    }


/* _______________________
    Posts 
*/
.social-main-view {
    grid-area: posts;
    border-left: solid 1px black;
    border-right: solid 1px black;
}
.new-post-div-flex {
    grid-area: center-panel;
    display: flex;
    flex-direction: column;
    border-left: solid 1px black;
    border-right: solid 1px black;
}
#new-post-input {
    height: fit-content;
    margin-top: 10%;
    margin-left: 1%;
    font-size: 18px;
}


/* _____________________
    Profile Pictures 
*/
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


/* __________________
    Logout Div
*/
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
.logout-div-menu-icon {
    width: 35px;
    height: 35px;
    align-self: center;
}


/* ____________________________
    Center Header Menu Button 
*/
#header-home-btn-div {
    position: fixed;
    grid-area: center-panel;
    width: 49.25vw;
    height: auto;
    text-align: center;
    background: rgb(255, 255, 255);
    cursor: pointer;
    font-weight: 600;
    font-size: 1.2vw;
}


/* ____________________________
    Button Bar 
*/
.post-btn-bar {
    display: flex;
    border-top: solid 1px black;
    border-bottom: solid 1px black;
    margin-top: 1%;
    padding: 5px;
    padding-right: 3%;
    justify-content: space-between;
}
#post-submit-btn {
    font-size: 1vw;
}
.button-bar-icon {
    width: 30px;
    height: 100%;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer;
}
#add-to-post-icons {
    margin-left: 5%;
    display: flex;
}

</style>