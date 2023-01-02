<template>

        <div id="profile-base-div">
            <div class="background-image">
        <div id="profile-div" class="profile-grid ">
        
            <profile id="profile" />

            <div id="menu-tab">

                <input id="my-profile-btn" 
                        class="profile-menu-btn" 
                        type="button" 
                        value="My Profile"
                        v-on:click="openMyProfileView()"
                        >

                <input id="create-profile-btn"
                        class="profile-menu-btn" 
                        type="button" 
                        value="Create Profile"
                        v-on:click="openCreateView()"
                        >

                <input id="update-profile-btn"
                        class="profile-menu-btn" 
                        type="button" 
                        value="Update Profile"
                        v-on:click="openUpdateView()"
                        >

                <input id="followers-btn"
                        class="profile-menu-btn" 
                        type="button" 
                        value="Follower's"
                        v-on:click="openFollowersView()"
                        >

                <input id="following-btn"
                        class="profile-menu-btn" 
                        type="button" 
                        value="Following"
                        v-on:click="openFolloweringView()"
                        >

                <input id="wallet-info-btn"
                        class="profile-menu-btn" 
                        type="button" 
                        value="Wallet Info"
                        >

                <input id="profile-settings-btn"
                        class="profile-menu-btn" 
                        type="button" 
                        value="Profile Settings"
                        >
            </div>


            <div id="createView" 
                    class="main-view" 
                    v-if="this.nav[1] == true"
                >
            </div>

            <div id="updateView"
                    class="main-view"
                    v-if="this.nav[2] == true"
                    >
            </div>

            <div id="followersView"
                    v-if="this.nav[3] == true"
                    >
                <div id="followers-count-div">
                    <p id="total-followers" class="followers">Total Followers: {{this.$store.state.followers.length}} </p>
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
                <p id="total-following"
                        class="social-app-following"
                        >Total Following: {{this.$store.state.following.length}} 
                </p>
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

        </div>
        </div>
        </div>

</template>

<script>
import Profile from '../components/Profile.vue'

export default {
    components: {Profile  },
    data() {
        let myProfileView = false;
        let createProfileView = false;
        let updateProfileView = false;
        let followersView = false;
        let followingView = false;
        let walletInfoView = false;
        let profileSettingsView = false;
        return {
            nav: [
                myProfileView = false,
                createProfileView = false,
                updateProfileView = false,
                followersView = false,
                followingView = false,
                walletInfoView = false,
                profileSettingsView = false
            ]
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
        openMyProfileView() {
            this.closeAll()
            this.nav[0] = true;
        },
        openCreateView() {
            this.closeAll()
            this.nav[1] = true;
        },
        openUpdateView() {
            this.closeAll()
            this.nav[2] = true;
        },
        openFollowersView() {
            this.closeAll()
            this.nav[3] = true;
        },
        openFolloweringView() {
            this.closeAll()
            this.nav[4] = true;
        },
        
        bounceBtn() {
            let item = this.classList
            console.log(item)
        }
    }

}
</script>

<style>

.profile-grid {
    display: grid;
    grid-template-columns: 1fr 4fr;
    grid-template-areas: 
    'profile-component profile-data'
    'nav-buttons profile-data';
}

.background-image {

    height: 100%;
    background-image: url(https://superalgos.org/img/photos/crypto-brain-bt.jpg);
    animation: slide 20s linear infinite;
    
}

@keyframes slide {
    0%{background-position-x: 0px; background-position-y: 0px;}
    25%{background-position-x: -10px; background-position-y: -10px;}
    50%{background-position-x: -20px; background-position-y: -20px;}
    75%{background-position-x: -10px; background-position-y: -10px;}
	100%{background-position-x: 0px; background-position-y: 0px;}
}


#profile-base-div {
    
    align-content: top;
    border: solid 2px black;
    border-radius: 8px;
    margin-right: 1vw;
    margin-left: 1vw;
    margin-bottom: 1em;
    height: 85vh;
    width:  auto;
    align-self: end;
    min-height: 300px;
    box-shadow: 0px 2px 10px 4px rgb(44, 44, 44);
}

#profile {
    grid-area: profile-component;
    background: rgb(228, 220, 209) 100%;
    box-shadow: 0px 2px 10px 4px rgba(245, 242, 242, .4);
}

#menu-tab {
    grid-area: nav-buttons;
    display: flex;
    flex-direction: column;
    justify-content: top;
    margin-left: 1vw;
    height: 40vh;
    width: 100%;
}

.profile-menu-btn {
    background: rgb(228, 220, 209);
    border: solid 2px black;
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    width: 88%;
    height: 3rem;
    margin-right: 1.2vw;
    text-align: center;
    font-size: 1.2vw;
    margin-bottom: 1vh;
    box-shadow: 0px 2px 10px 4px rgba(245, 242, 242, .4);
}

.profile-menu-btn:hover {
    border: solid 2px black;
    width: 92%;
    font-weight: 500;
}

.main-view {
    grid-area: profile-data;
    background: rgb(228, 220, 209) 100%;
    box-shadow: 0px 2px 10px 4px rgba(245, 242, 242, .4);
    margin-right: 1vw;
    margin-left: 1vw;
    margin-bottom: 1em;
    margin-top: 1em;
    border: solid black;
    border-radius: 20px;
    align-self: center;
    height: 75%;
}

#followersView {
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

.followers {
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

#followers-div {
    display: flex;
    background: rgb(228, 220, 209) 100%;
    height: 35%;
    min-width: 150px;
    margin-left: 5vw;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
}



@keyframes pulse {
  from { transform: scale(0.9); }
  to { transform: scale(1.1); }
}

</style>