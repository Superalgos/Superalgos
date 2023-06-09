<template>
    <div class="modal-profile-overlay">
        <div id="" class="profile" >
            <div class="top-bar">
                <p  class="bold center-header">Profile</p>
                <input class="close-btn" type="button" value="X" v-on:click="closeUsersProfile">
            </div>
            <div class="profile-body">
                <!-- Default Profile Panel Body -->
                <div class="update-profile-pic">
                <div class="profile-panel-body">
                    <div class="profile-head-left-div">
                        <!-- Profile Picture -->
                        <img class="profile-pic" v-bind:src="usersImageSrc" alt="">
                        <!-- Profile Username -->
                        <p id="profile-username">{{$store.state.usersProfileToOpen.name}}</p>
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
                        <input ref="followButton" type="button" :value="followBtnText" v-on:click="followOrUnfollow">


                    </div>
                    <!-- Body Main -->
                    <div class="profile-main-body">
                        <!-- Name -->
                        <div class="update-profile-option">
                            <p><strong>Name:</strong> {{$store.state.usersProfileToOpen.name}} </p>
                        </div>
                        <!-- Bio -->
                        <div class="update-profile-option">
                            <p><strong>Bio:</strong> {{$store.state.usersProfileToOpen.bio}}</p>
                        </div>
                    </div>
                </div>
            </div>

            
            </div>
        </div>
    </div>
</template>

<script>
import store from '../../../store/index'
import { followUser } from '../../../services/SocialService'
import { getProfileStats } from '../../../services/ProfileService'

export default {
  components: {  },
    name: 'users-profile-panel',
    data() {
    return {
        followersCount: 0,
        followingCount: 0,
        followBtnText: 'Follow User'
        };
    },
    methods: {
        closeUsersProfile() {
            store.commit("CLOSE_USERS_PROFILE");
        },
        followOrUnfollow() {
            let followButtonValue = this.$refs.followButton.value
            let userToFollowID = store.state.usersProfileToOpen.originSocialPersonaId
            let myNodeId = store.state.profile.nodeId
            let eventType = followButtonValue === "Follow User" ? 15 : 16;

            let message = {
                originSocialPersonaId: myNodeId,
                targetSocialPersonaId: userToFollowID,
                eventType: eventType
            }

            followUser(message)
            .then(response => {
                let responseData = response.data
                if (responseData.result === "Ok") {
                    if (this.followBtnText === "Follow User") {
                        this.followBtnText = "Unfollow User";
                    } else {
                        this.followBtnText = "Follow User";
                    }
                } else {
                    console.log("[WARN] UsersProfilePanel - TODO handle users already following on app start to display correct state.")
                }
            });
        },
    },
    computed: {
        getProfileVisibility() {
            return store.state.showUsersProfile;
        },
        usersImageSrc() {
            return store.state.usersProfileToOpen.profilePic;
        },
        showThisUsersProfile() {
            return store.state.showUsersProfile
        }
    },
    created() {
        // On Created we will retrieve the follower / following data that relates to the target profile.
        let userToFollowID = store.state.usersProfileToOpen.originSocialPersonaId
        let myNodeId = store.state.profile.nodeId

        let thisMessage = {
            originSocialPersonaId: myNodeId,
            targetSocialPersonaId: userToFollowID
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