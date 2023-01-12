<template>
    <div class="modal-profile-overlay" v-if="getProfileVisibility">
        <div id="" class="profile" >
            <div class="top-bar">
                <p  class="bold">Profile</p>
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
                                <p class="count">{{$store.state.profile.followers}}</p>
                            </div>
                            <div id="following-div">
                                <p>Following</p>
                                <p class="count">{{$store.state.profile.following}}</p>
                            </div>
                        </div>
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
                    <div id="update-profile-btn-div">
                        <input class="update-profile-btn" type="button" value="Update Profile" v-on:click="sendProfileUpdate">
                    </div>
                </div>
                <!-- Body Main -->
                <div class="profile-main-body">
                    <!-- Name input / label -->
                    <div class="update-profile-option">
                        <label class="update-profile-labels" for="name">Name: </label>
                        <input type="text" name="name" id="name-input" v-model="profileData.name" :placeholder="$store.state.profile.name">
                    </div>
                    <!-- Bio input / label -->
                    <div class="update-profile-option">
                        <label class="update-profile-labels" for="bio">Bio: </label>
                        <textarea name="bio" id="bio-text-area" cols="60" rows="5" v-model="profileData.bio"></textarea>
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
import store from '../../store/index'
import UploadImagePanel from '../UploaderComponents/UploadImagePanel.vue';
import { updateProfile } from '../../services/ProfileService'

export default {
  components: { UploadImagePanel },
    name: 'profile-panel',
    data() {
    return {
        updateProfilePanel: false,
        setProfileImage: false,
        profileData: {
            name: '',
            bio: ''
        }
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
        sendProfileUpdate() {
            let message = this.profileData
            message.profilePic = this.imageSrc
            message.originSocialPersonaId = store.state.profile.nodeId
            console.log(message)
            updateProfile(JSON.stringify(message))
            .then(response => {
                console.log(response.data)
            })
        }
    },
    computed: {
        getProfileVisibility() {
            return store.state.showProfile;
        },
        imageSrc() {
            return store.state.profile.profilePic;
        }
    },
    created() {
        this.profileData.bio = store.state.profile.bio
        this.profileData.name = store.state.profile.name
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
    justify-content: space-between;
    margin-right: 1%;
    margin-left: 45%;
    align-items: center;
}
.close-btn {
    height: 30px;
    width: 30px;
    text-align: center;
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
    border-top: solid 1px black;
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
    height: 68.5vh;
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

/* Update Profile */

.update-profile-option {
    display: flex;
    margin: 2%;
}

.update-profile-labels {
    font-weight: 600;
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