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
                <div class="new-post-div" v-if="!$store.state.showPostComments">
                    <!-- Profile Picture -->
                    <div>
                        <img class="small-profile-pic" v-bind:src="imageSrc" alt="">
                    </div>
                    <!-- Text Input -->
                    <div ref="editableDiv" name="new-post-input" id="new-post-input" placeholder="What's happening?" @input="updatePostBody" @change="getPostBody" contentEditable="true" >
                    </div>
                </div>
                <!-- Selected Users Profile Header -->
                <div class="new-post-div" v-if="$store.state.showPostComments" >
                    <!-- Banner Image -->
                    <div id="header-profile-data-div" v-if="$store.state.headerProfileData !== undefined" :style="`background-image: url(${usersBannerImageSrc});`"  >
                        <!-- Profile Picture / Name -->
                        <div id="image-name-header-data" >
                            <img class="small-profile-pic" v-bind:src="usersImageSrc" alt="">
                            <p id="header-profile-data-name">{{$store.state.headerProfileData.name}}</p>
                        </div>
                        <!-- Profile Bio -->
                        <div id="header-data-bio-div">
                            <p>{{$store.state.headerProfileData.bio}}</p>
                        </div>
                    </div>
                </div>
                <!-- New Post Button Bar -->
                <div class="post-btn-bar" v-if="!$store.state.showPostComments">
                    <!-- Add to post Icons -->
                    <div id="add-to-post-icons">
                        <img src="../assets/iconmonstrImageIcon.png" alt="Add Image" class="button-bar-icon" v-on:click="toggleUploadImage">
                        <img src="../assets/iconmonstrEmojiIcon.png" alt="Add Image" class="button-bar-icon" v-on:click="showEmojiPicker" >
                    </div>
                    <!-- Emoji Picker -->
                    <div id="emoji-component" v-if="getEmojiPicker"  >
                            <emoji-picker 
                                :postReaction="false" 
                                :location="emojiDisplayLocation" 
                                :originSocialPersonaId="originSocialPersonaId"
                            
                            />
                    </div>
                    <!-- Submit Post Button -->
                    <div id="submit-btn-div">
                        <input id="post-submit-btn" type="button" value="Post" v-on:click="sendPost">
                    </div>
                </div>
            </div>
            <!-- Menu Div -->
            <div id="menu-tab-social-trading">
                <!-- Menu Component -->
                <main-menu />
                <!-- Profile Component -->
                <div v-if="showProfileComponent">
                    <profile-panel />
                </div>
                <!-- Wallet Component -->
                <div v-if="showWalletComponent">
                    <wallet-panel />
                </div>
                <!-- Settings Component -->
                <div v-if="showSettingsComponent">
                    <settings-panel />
                </div>
            </div>
            <!-- Logout Component (bottom left) -->
            <div class="logout-component">
                <logout-component />
            </div>
            <!-- Posts are here -->
            <div id="home-view-main" class="social-main-view content-container" v-if="!showPostComments">
                <!-- Post-List Component -->
                <div id="post-list-container">
                    <post-list />
                </div>
                <!-- Temp Refresh Needed Message -->
                <p class="center" v-if="$store.state.posts.length == 0">Refresh the webpage once network node connects to retrieve posts.</p>
            </div>
            <!-- Post Comments replace Post list here -->
            <div id="post-comments-main-view" class="social-main-view content-container" v-if="showPostComments">
                <post-comments
                    :postData="postData"
                    :repostData="getRepostData"
                />
            </div>
            <!-- Follow Panel -->
            <div>
                <follow-panel />
            </div>
            <!-- Image Uploader Component -->
            <div>
                <upload-image-panel />
            </div>
            <!-- Other Users Profiles -->
            <div id="users-profile-panel-div-show" v-if="showThisUsersProfile" >
                <users-profile-panel />
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
import ProfilePanel from '../components/ProfileComponents/MyProfileComponents/ProfilePanel.vue'
import EmojiPicker from '../components/EmojiComponents/EmojiPicker.vue';
import UploadImagePanel from '../components/UploaderComponents/UploadImagePanel.vue'
import UsersProfilePanel from '../components/ProfileComponents/UsersProfileComponents/UsersProfilePanel.vue'
import PostComments from '../components/PostComponents/PostComments.vue';
import LogoutComponent from '../components/LogoutComponent.vue';
import MainMenu from '../components/MenuComponents/MainMenu.vue';


export default {
    components: { PostList, FollowPanel, WalletPanel, SettingsPanel, ProfilePanel, EmojiPicker, UploadImagePanel, UsersProfilePanel, PostComments, LogoutComponent, MainMenu },
    data() {
        let home = true;
        let profile = false;
        let wallet = false;
        let settings = false;
        let postBody = "";
        let postData = undefined;
        let emojiDisplayLocation = undefined;
        let originSocialPersonaId = undefined;
        return {
            postBody: '',
            postData: undefined,
            emojiDisplayLocation: undefined,
            originSocialPersonaId: undefined,
        }
    },
    methods: {
        sendPost() {
            let message = {
                originSocialPersonaId: this.$store.state.profile.nodeId,
                userName: store.state.profile.userProfileHandle
                            + ' '
                            + store.state.profile.nodeCodeName,
                postText: this.postBody,
                postImage: store.state.postImage
            }
            // If the post is not empty we will send it.
            if (message.postText !== '' || store.state.postImage !== undefined) {
            createPost(message)
                .then(response => {
                    this.postBody = '';
                    getFeed();
                    store.commit("ADD_POST_IMAGE", "");
                    let postMessage = document.getElementById("new-post-input");
                    postMessage.innerText = "";
                    this.updatePostBody();
                });
            }
        },
        scrollUp() {
            window.scrollTo(window.innerHeight, 0);
            if (store.state.showPostComments) {
                getFeed();
                store.commit("SHOW_POSTS_COMMENTS", false);
            }
        },
        showEmojiPicker(event) {
            let isDisplayed = store.state.showEmojiPickerNewPost;
            if (event !== undefined) {
            let clickLocation = {
                    x: event.pageX,
                    y: event.pageY
            }

            this.emojiDisplayLocation = clickLocation
            this.originSocialPersonaId = store.state.profile.nodeId
            store.commit("SHOW_EMOJI_PICKER_NEW_POST", !isDisplayed);
            }
        },
        updatePostBody() {
            let postMessage = document.getElementById("new-post-input")
            this.postBody = postMessage.innerText;
            
            this.$nextTick(() => {
                let el = this.$refs.editableDiv;
                el.focus();
                let range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                let sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            });
        },
        toggleUploadImage() {
            let isDisplayed = store.state.showImageUploader;
            store.commit("SHOW_IMAGE_UPLOADER", !isDisplayed);
        },
        addImage() {
            let el = this.$refs.editableDiv;
            el.focus();
            let html = `<img src="${store.state.postImage}" style="max-width: 100%; max-height: 500px display: block; margin:auto" class="post-message" />`;
            let range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            el.appendChild(range.createContextualFragment(html));
        }
    },
    // Live values returned from computed functions.
    computed: {
        imageSrc() {
            return store.state.profile.profilePic;
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
            return store.state.showEmojiPickerNewPost
        },
        insertEmoji() {
            if(store.state.selectedEmoji !== undefined) {
                this.postBody = this.postBody + store.state.selectedEmoji
            }
            return this.postBody
        },
        getPostBody() {
            return this.postBody;
        },
        shouldUpdateImagePanel() {
            return store.state.showImageUploader;
        },
        getPostImage() {
            if(store.state.postImage !== undefined) {
                this.addImage()
            }
            return store.state.postImage;
        },
        showThisUsersProfile() {
            return store.state.showUsersProfile;
        },
        showPostComments() {
            return store.state.showPostComments;
        },
        usersImageSrc() {
            return store.state.headerProfileData.profilePic;
        },
        usersBannerImageSrc() {
            return store.state.headerProfileData.bannerPic;
        },
        getRepostData() {
            this.repostData = store.state.repostData;
            return store.state.repostData;
        }
    },
    // The below are used to keep things updated. 
    watch: {
        insertEmoji(newValue, oldValue) {},

        getEmojiPicker(newValue, oldValue) {
            if (!newValue) {
                store.commit("RESET_EMOJI");
            }
        },

        getPostImage(newValue, oldValue) {},

        getPostBody(newValue, oldValue) {
            let postText = document.getElementById('new-post-input')
            if (store.state.postImage !== undefined) {
            this.updatePostBody()
            } else {
                postText.innerText = this.postBody
            }
        
        },
        showPostComments(newValue, oldValue) {
            this.postData = store.state.postCommentProps
            console.log("THIS POST DATA")
            console.log(this.postData)
        },
        getRepostData(newValue, oldValue) {
            this.repostData = store.state.repostData
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
.new-post-div {
    display: flex;
    flex-direction: row;
    margin-top: 10%;
    align-items: flex-end;
    width: 100%;
}
#new-post-input {
    border: solid 2px black;
    font-size: 18px;
    width: 85%;
    max-width: 750px;
    height: fit-content;
    white-space: pre-wrap;
    border-radius: 4px;
    margin: 1% 0% 1% 2%;
    padding-left: 1%;
}


/* _____________________
    Profile Pictures 
*/
.small-profile-pic {
    width: 5vw;
    height: 5vw;
    border-radius: 100%;
    margin-top: 9%;
    margin: 10% 0% 0% 10%;
    border: solid 2px black;
    align-content: left;
}


/* __________________
    Logout Div
*/
.logout-component {
    grid-area: left-panel;
    position: fixed;
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
    margin-top: 0%;
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



#header-profile-data-div {
    display: flex;
    width: 100%;
}

#image-name-header-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-weight: 600;
    font-size: 1vw;
}

#header-profile-data-name {
    margin-left: 10%;
}

#header-data-bio-div {
    display: flex;
    align-self: center;
}

</style>