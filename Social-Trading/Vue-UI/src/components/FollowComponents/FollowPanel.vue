<template>
    <div id="follow-panel-main-div">
        <div id="follow-panel-inner-div">
        <p id="follow-panel-title" class="center bold">User's to Follow</p>
            <div id="follow-panel-users" v-for="user in users" v-bind:key="user" v-on:click="openUsersProfile(user)">

                <img class="follow-profile-pic" v-bind:src="user.profilePic" alt="">
                <p class="scaling-text center-up">{{user.name}}</p>
            </div>
        </div>
        
    </div>
</template>

<script>
import { getAllUsers } from '../../services/SocialService'
import store from '../../store/index'

export default {
    name: 'follow-panel',
    data() {
    return {
        }
    },
    components: {},
    computed: {
        users() {
            return store.state.users;
        }
    },
    methods: {
        openUsersProfile(user) {
            store.commit("SET_USERS_PROFILE_TO_OPEN", user)
            store.commit("OPEN_USERS_PROFILE");
        }
    },
    created() {
        const userID = store.state.profile.nodeId
            let message = {
                originSocialPersonaId: userID
            }
            getAllUsers(message)
    }
}
</script>

<style>

#follow-panel-main-div {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    width: 25vw;
}

#follow-panel-users {
    display: flex;
    width: 100%;
    margin: 3%;
    padding: 4px;
}

#follow-panel-users:hover {
    background: rgba(182, 182, 182, 0.568);
    border-radius: 20px;
    width: auto;
    padding: 4px;
    cursor: pointer;
}

.follow-profile-pic {
    width: 3.5vw;
    height: 3.5vw;
    border-radius: 100%;
    border: solid 1px black;
}

#follow-panel-inner-div {
    width: 60%;
    margin-top: 10%;
    background-color: rgba(182, 182, 182, 0.281);
    border-radius: 20px;
}
#follow-panel-title {
    border-bottom: solid 1px black;
    margin-top: 2%;
}

.scaling-text {
    font-size: 1vw;
}

.center-up {
    justify-self: center;
    align-self: center;
}

</style>