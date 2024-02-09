<template>
    <div class="modal-profile-overlay" v-if="getProfileVisibility">
        <div id="" class="profile" >
            <div class="top-bar">
                <p class="bold center-header">Profile</p>
                <input class="close-btn" type="button" value="X" v-on:click="closeProfile">
            </div>
            <div class="profile-body">
                <!-- Default Profile Panel Body -->
                <div class="update-profile-pic">
                <div class="profile-panel-body" v-if="!updateProfilePanel">
                    <div class="profile-head-left-div">
                        <!-- Profile Picture -->
                        <img class="profile-pic" v-bind:src="imageSrc" alt="">
                        <!-- Profile Username -->
                        <p id="profile-username">{{$store.state.profile.userProfileHandle}}</p>
                        <!-- Followers / Following Counts -->
                        <div id="follower-following">
                            <div id="followers-div">
                                <p>Followers</p>
                                <p class="count">{{followersCount}}</p>
                            </div>
                            <div id="following-div">
                                <p>Following</p>
                                <p class="count">{{followingCount}}</p>
                            </div>
                        </div>
                        <!-- Update Profile Button -->
                        <input type="button" value="Update Profile" v-on:click="updateProfilePanel = true">
                    </div>
                    <!-- Body Main -->
                    <div class="profile-main-body">
                        <!-- Name -->
                        <div class="update-profile-option">
                            <p><strong>Name:</strong> {{$store.state.profile.name}} </p>
                        </div>
                        <!-- Bio -->
                        <div class="update-profile-option">
                            <p><strong>Bio:</strong> {{$store.state.profile.bio}}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Update Profile Panel Body -->
            <div class="profile-panel-body" v-if="updateProfilePanel">
                <!-- Body Left side -->
                <div id="update-profile-pic" >
                    <div class="update-profile-head-left-div">
                    <!-- Profile Picture -->
                    <img class="profile-pic" v-bind:src="imageSrc" alt="">
                    <!-- Profile Username -->
                    <p id="profile-username">{{$store.state.profile.userProfileHandle}}</p>
                    <!-- Set Profile Image Button -->
                    <input type="button" value="Set Profile Image" v-on:click="addProfileImage">
                    <!-- Set Profile Banner Button -->
                    <input type="button" value="Set Banner Image" v-on:click="addBannerImage">
                    <!-- Update GitHub Info Button -->
                    <input type="button" value="Update GitHub Info" v-on:click="updateGithubInfo ? updateGithubInfo = false : updateGithubInfo = true ">
                    <!-- Update Profile Button -->
                    <div id="update-profile-btn-div">
                        <input class="update-profile-btn" type="button" value="Update Profile" v-on:click="sendProfileUpdate">
                    </div>
                </div>
                <!-- Body Main -->
                <div class="profile-main-body">
                    <!-- GitHub Info -->
                    <div id="github-info-main-div" v-if="updateGithubInfo">
                        <github-info-component />
                    </div>
                    <!-- Update Profile Component -->
                    <div id="update-profile-info-div" v-if="!updateGithubInfo">
                        <update-profile-component />
                    </div>
                </div>
                    <!-- Image Uploader -->
                    <div>
                        <upload-image-panel />
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
</template>

<script>
import store from '../../../store/index'
import UploadImagePanel from '../../UploaderComponents/UploadImagePanel.vue';
import { getProfileStats } from '../../../services/ProfileService'
import GithubInfoComponent from './GithubInfoComponent.vue';
import UpdateProfileComponent from './UpdateProfileComponent.vue';
import superalgos from '../../../assets/superalgos.png'


export default {
  components: { UploadImagePanel, GithubInfoComponent, UpdateProfileComponent },
    name: 'profile-panel',
    data() {
    return {
        updateProfilePanel: false,
        updateGithubInfo: false,
        setProfileImage: false,
        followersCount: 0,
        followingCount: 0
        };
    },
    methods: {
        closeProfile() {
            store.commit("SHOW_PROFILE", false);
            return store.state.showProfile
        },
        addProfileImage() {
            this.setProfileImage = true;
            store.commit("SHOW_IMAGE_UPLOADER", true);
        },
        addBannerImage() {
            store.commit("SET_ADD_PROFILE_BANNER", true);
            store.commit("SHOW_IMAGE_UPLOADER", true);

        },
        sendProfileUpdate() {
            store.commit("UPDATING_PROFILE", true);
        }
    },
    computed: {
        getProfileVisibility() {
            return store.state.showProfile;
        },
        imageSrc() {
            if (store.state.profile.profilePic === '') {
                return superalgos
            } else {
                return store.state.profile.profilePic;
            }
        },
        bannerImageSrc() {
            if (store.state.profile.bannerPic !== undefined) {
                return store.state.profile.bannerPic
            }
        }
    },
    created() {
        // On Created we will retrieve the follower / following data that relates to the target profile.
        let myNodeId = store.state.profile.nodeId

        let thisMessage = {
            originSocialPersonaId: myNodeId,
            targetSocialPersonaId: myNodeId
        }
        getProfileStats(thisMessage)
            .then(response => {
                this.followersCount = response.data.followersCount
                this.followingCount = response.data.followingCount
            });
    }
};
</script>

<style>
.modal-profile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
}
.profile {
    background-color: rgb(240, 238, 238);
    border: solid 0.5px rgba(0, 0, 0, 0.479);
    border-radius: 20px;
    width: 75vw;
    height: 75vh;
    color: black;
}
.top-bar {
    display: flex;
    flex-direction: row;
    justify-content: right;
    width: 100%;
    height: 50px;
    text-align: center;
    border-bottom: solid 1px black;
}
.center-header {
    margin: auto;
    font-size:  28px;
}
.close-btn {
    position: absolute;
    height: 30px;
    width: 30px;
    text-align: center;
    margin: 10px;
    cursor: pointer;
}
.close-btn:hover {
    background-color: rgba(243, 45, 45, 0.884);
    border: solid 1px red;
    border-radius: 3px;
}

#update-profile-pic {
    display: flex;
    width: 75vw;
    height: 68.5vh;
    border-bottom-left-radius: 20px;
    
}

/*Profile Panel Body*/
.profile-panel-body {
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-template-areas:
    'profile-head profile-body' ;
    width: 100%;
    height: 91%;
}

.profile-head-left-div {
    grid-area: profile-head;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.update-profile-head-left-div {
    grid-area: profile-head;
    width: 33.5%;
    height: 68.5vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.profile-main-body {
    grid-area: profile-body;
    width: 100%;
    height: 100%;
    border-left: solid 1px rgba(0, 0, 0, 0.233);
    border-bottom-right-radius: 20px;
}


/*Profile Picture*/
.profile-pic {
    width: 15vw;
    height: 15vw;
    border-radius: 100%;
    border: solid 1px black;
    margin-top: 5%;
}
#profile-username {
    font-size: 1vw;
    font-weight: 600;
}



/* Followers / Following */
#follower-following {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: auto;
    justify-content: space-around;
}
#followers-div {
    display: flex;
    flex-direction: row;
    font-size: 1vw;
}
#following-div {
    display: flex;
    flex-direction: row;
    font-size: 1vw;
}
.count {
    margin-left: 5px;
}


/* Profile Body Left Area */
.update-profile-btn {
    width: 100%;
    height: 20%;
    font-size: 1.7vw;
    border: inset 1px black;
    border-bottom-left-radius: 20px;
    background-color: rgba(182, 182, 182, 0.281);
}

.update-profile-btn:hover {
    background-color: rgba(182, 182, 182, 0.521);
}

#update-profile-btn-div {
    display: flex;
    align-items: end;
    width: 100%;
    height: 100%;
    
}
</style>