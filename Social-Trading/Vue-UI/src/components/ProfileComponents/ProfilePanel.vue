<template>
    <div class="modal-profile-overlay" v-if="getProfileVisibility">
        <div id="" class="profile" >
            <div class="top-bar">
                <p  class="bold">Profile</p>
                <input class="close-btn" type="button" value="X" v-on:click="closeProfile">
            </div>
            <div id="profile-panel-body">
                <div id="profile-head-left-div">
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
                </div>
                
            </div>
        </div>
    </div>
</template>

<script>
import store from '../../store/index'

export default {
    name: 'profile-panel',
    data() {
    return {
        };
    },
    methods: {
        closeProfile() {
            store.commit("SHOW_PROFILE", false);
            return store.state.showProfile
        }
    },
    computed: {
        getProfileVisibility() {
            return store.state.showProfile;
        },
        imageSrc() {
            return store.state.profile.profileImg;
        }
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

/*Profile Panel Body*/
#profile-panel-body {
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-template-areas:
    'profile-head profile-body' ;
    width: 100%;
    height: 91%;
    border-top: solid 1px black;
}

#profile-head-left-div {
    grid-area: profile-head;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
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


</style>