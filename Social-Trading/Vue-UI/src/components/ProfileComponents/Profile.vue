<template>
    <div class="modal-overlay" v-if="getVisibility">

        <div class="profile profile-grid-view">
            <p id="profile-head-label">Profile</p>
            
            <div id="profile-img-div">
                <img id="profile-img" v-bind:src="imageSrc" alt="Profile Picture">
                <p id="welcome-user">Welcome {{$store.state.profile.userProfileHandle}}</p>

                <div id="followers-following-div">
                    <div id="followers-div">
                        <label for="followers">Followers</label>
                        <p>{{$store.state.profile.followers}}</p>
                    </div>
                    
                    <div id="following-div">
                        <label for="following">Following</label>
                        <p>{{$store.state.profile.following}}</p>
                    </div>
                    
                </div>
                
            </div>

            <div id="profile-content-div">

                <!-- Username -->
                <div class="profile-content-entry">
                    <label class="content-entry-label" for="username">Username:</label>

                    <p v-if="!updateProfileContent">{{$store.state.profile.userProfileHandle}}</p>

                    <!-- TODO connect and make user input update -->
                    <input v-if="updateProfileContent" type="text" name="username" v-bind:placeholder="$store.state.profile.userProfileHandle" >
                </div>

                <!-- Profile Image URL -->
                <div class="profile-content-entry">
                    <label class="content-entry-label" for="profile-img-url">Profile Image URL:</label>

                    <p v-if="!updateProfileContent">Update Profile to Update</p>
                    
                    <!-- TODO connect and make user input update -->
                    <input v-if="updateProfileContent" type="text" name="profile-img-url" v-bind:placeholder="imageSrc" >
                </div>

                <div class="profile-content-entry">
                    <label for="bio">Bio:</label>
                    <textarea name="bio" id="profile-bio" cols="80" rows="10" v-model="profileBio"></textarea>
                </div>
                

            </div>  
            
            <div id="option-btns-div">
                <input type="button" value="Close" v-on:click="closeProfile">
            </div>
            

        </div>
            
            
                
        

    </div>
</template>

<script>

import store from '../../store/index'
import { createProfile, createSocialPersona, getSocialPersona } from '../../services/ProfileService'

export default {
    name: 'profile-component',
    data() {
    return {
            updateProfileContent: false,
            profileBio: undefined
        };
    },
    methods: {
        
    },
    computed: {
        getVisibility() {
            let v = this.$store.state.showProfile 
            return v;
        },
        imageSrc() {
            return this.$store.state.profile.profileImg;
        },
        closeProfile() {
                store.commit("SHOW_PROFILE", false);
            }
}
};
</script>

<style>
.modal-overlay {
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
    width: 85vw;
    height: auto;
    color: black;
}

#profile-img {
    width: 20vw;
    height: 20vw;
    border-radius: 100%;
    border: solid 1px black;
}

.profile-grid-view {
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-template-areas: 
    'head-label head-label'
    'img-div profile-content'
    'option-btns option-btns';
}


#profile-head-label {
    grid-area: head-label;
    text-align: center;
    border-bottom: solid 1px black;
    font-weight: 600;
    font-size: 1vw;
}

#profile-img-div {
    grid-area: img-div;
    text-align: center;
}

#profile-content-div {
    grid-area: profile-content;
}

#option-btns-div {
    grid-area: option-btns;
    display: flex;
    justify-content: right;
    margin-right: 2%;
}

.profile-content-entry {
    display: flex;
}

.content-entry-label {
    margin-right: 1%;
}

#followers-following-div {
    display: flex;
    justify-content: space-around;
}

#welcome-user {
    margin-top: 3%;
    font-size: 1.2vw;
}


</style>