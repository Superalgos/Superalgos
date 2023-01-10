<template>
    <div id="follow-panel-main-div">
    <p>Test Text</p>
        <div id="follow-panel-users" v-for="user in users" v-bind:key="user">
        </div>
    </div>
</template>

<script>
import { getProfiles } from '../../services/ProfileService'

export default {
    name: 'follow-panel',
    components: {
    },
    computed: {
        users() {
            return this.$store.state.users;
        },
    },
    data() {
        return {
        }
    },
    created() {
        getProfiles()
    }
}
</script>

<style>

</style>