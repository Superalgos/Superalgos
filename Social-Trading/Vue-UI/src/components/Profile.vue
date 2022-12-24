<template>


            <div id="profile">

                <div id="profile-picture-div">
                    <img id="profile-picture" :src="profile.picture" 
                    alt="Profile Picture" >
                </div>

                <div class="username-div">
                    <p  id="profile-username" class="profile-username">{{this.$store.state.profile.username}}</p>

                </div>
                
            </div>


</template>

<script>

import NetworkNodeInterface from '../services/NetworkNodeInterface.js'

export default {
    name: "user-profile",
    data() {
        return {
            showform: true,
            profile: {
                id: 0,
                username: '',
                picture: 'https://raw.githubusercontent.com/theblockchainarborist/Social_Trading_App/main/Images/Profile_Picture.png'

            }
        }
    },
    methods: {
        createProfile() {
            this.$store.commit('CREATE_PROFILE', this.profile);
        }
    },
    created() {
        NetworkNodeInterface
            .getGithubInfo()
            .then(response => {
                this.testMessage = response.status
            })
    }
}
</script>

<style>

#profile {
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas: 
    'picture'
    'picture'
    'picture'
    'picture'
    'username';
    border: solid 2px black;
    border-radius: 12px;
    height: 16vw;
    width: 17vw;
    margin: 1vw;
    padding: 1vw, 1vw, 1vw, 1vw;
}


#profile-picture-div {
    grid-area: picture;
    width: 100%;
    height: 100%;
}

#profile-picture {
    display: flex;
    width: 15vw;
    border-radius: 100%;
    border: solid black;
    margin: 1vw 1vw 0vw 1vw;
    
}

.username-div {
    display: flex;
    width: 100%;
    height: 100%;
    grid-area: username;
    justify-content: center;
    justify-self: center;
    position: inherit;
}


#profile-username {
    font-size: 1.5vw;
}








</style>