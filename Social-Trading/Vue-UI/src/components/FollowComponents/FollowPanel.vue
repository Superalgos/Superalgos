<template>
    <div id="follow-panel-main-div">
        <div id="follow-panel-users" v-for="user in users" v-bind:key="user">
            <img class="follow-profile-pic" v-bind:src="user.profilePic" alt="">
            <p>{{user.name}}</p>
        </div>

    </div>
</template>

<script>
import { getAllUsers } from '../../services/SocialService'
import store from '../../store/index'

export default {
    name: 'follow-panel',
    components: {
    },
    computed: {
        users() {
            return store.state.users;
        },
    },
    methods: {
    },
    data() {
        return {
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

#follow-panel-users {
    display: flex;
}

.follow-profile-pic {
    width: 50px;
    height: 50px;
    border-radius: 100%;
    border: solid 1px black;
}

</style>