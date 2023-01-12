<template>
    <div id="follow-panel-main-div">
        <div id="follow-panel-users" v-for="user in users" v-bind:key="user">
            <p>{{user.name}}</p>
        </div>
        <input type="button" value="GET USERS" v-on:click="getUserList">
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
        getUserList() {
            if (store.state.profile.nodeId === undefined) {
                this.getUserList()
                return;
            }
            const userID = store.state.profile.nodeId

            let message = {
                originSocialPersonaId: userID
            }
            getAllUsers(message)
            
        }
    },
    data() {
        return {
        }
    },
    created() {
        
    }
}
</script>

<style>

</style>