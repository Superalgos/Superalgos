<template>
    <div class="app-container">
        

        
        <router-view class="dashboard-view" :incomingData="incomingDataObj" :timestamp="timestampObj"></router-view>

        <!-- The CreateProfile component -->
        <div v-if="showCreateProfileComponent">
            <create-profile />
        </div>

        <div v-if="showProfileComponent">
            <profile />
        </div>

        
    </div>
</template>

<script>
import background from "./assets/superalgos-header-background.png"
import CreateProfile from './components/ProfileComponents/CreateProfile.vue'
import store from './store/index'
import Profile from './components/ProfileComponents/Profile.vue'
import { getSocialPersona } from './services/ProfileService'

    export default {
        components: { CreateProfile, Profile },
        data() {
            return {
                incomingDataObj: {},
                background: background,
                isActive: false,
                timestampObj: '',
            };
        },
        computed: {
            dashboards () {
                return this.$router.getRoutes()
            },
            showProfileComponent() {
                return store.state.showProfile
            },
            showCreateProfileComponent() {
                return store.state.showCreateProfile
            }
        },
        methods: {
            openMenu(){
				if(this.$refs.LeftDrawer.active){
					this.$refs.LeftDrawer.close();					
				}else{
					this.$refs.LeftDrawer.open();
				}
			},
            openSettings(){
				if(this.$refs.RightDrawer.active){
					this.$refs.RightDrawer.close();					
				}else{
					this.$refs.RightDrawer.open();
				}
			},
            openProfile() {
                store.commit("SHOW_PROFILE", true);
            },
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
  

