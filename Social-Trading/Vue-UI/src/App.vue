<template>
    <div class="app-container">

        <router-view class="dashboard-view" :incomingData="incomingDataObj" :timestamp="timestampObj"></router-view>

        <!-- The CreateProfile component -->
        <div v-if="showCreateProfileComponent">
            <create-profile />
        </div>

    </div>
</template>

<script>
import CreateProfile from './components/ProfileComponents/MyProfileComponents/CreateProfile.vue'
import store from './store/index'
import { getSocialPersona } from './services/ProfileService'

    export default {
        components: { CreateProfile },
        data() {
            return {
                
            };
        },
        computed: {
            showProfileComponent() {
                return store.state.showProfile
            },
            showCreateProfileComponent() {
                return store.state.showCreateProfile
            }
        },
        methods: {
            getSocialPersona () {
                let response = getSocialPersona()
            console.log(JSON.stringify(response.data))
            this.$store.commit("ADD_PROFILE", response)
        },
        },
        mounted: function () {
        },
        created: function () {
            this.getSocialPersona()
        }, 
    }
</script>

<style>
    ::-webkit-scrollbar {
        width: 5px;
    }

    ::-webkit-scrollbar-thumb {
    background: rgb(122, 122, 122);
    }

    ::-webkit-scrollbar-track {
    background: #f1f1f1;
    }

    .app-container {
        font:400 17px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        height: 100%;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-areas: 
        'header'
        'body';
        margin-top: -8px;
        margin-left: -8px;
        color: black;
    }
    
    

</style>
  

