<template>
    <div class="app-container">
        

        <Drawer class="drawer-theme" :direction="'left'" :exist="true" ref="LeftDrawer">
            <img class="logo" :src="logo" >
            <div class="dash-link-container" v-for="dashboard in dashboards" v-bind:key="dashboard">
                <router-link class="dash-link" :to="{ name: dashboard.name }" >{{dashboard.name}} </router-link>
            </div>
        </Drawer>
        <Drawer class="drawer-theme" :direction="'right'" :exist="true" ref="RightDrawer">Settings Coming Soon!</Drawer>
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
import Drawer from './components/Drawer.vue'
import logo from "./assets/superalgos-logo-white.png"
import background from "./assets/superalgos-header-background.png"
import CreateProfile from './components/ProfileComponents/CreateProfile.vue'
import store from './store/index'
import Profile from './components/ProfileComponents/Profile.vue'
import { getSocialPersona } from './services/ProfileService'

    export default {
        components: { Drawer, CreateProfile, Profile },
        data() {
            return {
                incomingDataObj: {},
                logo: logo,
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
        // Spin up websocket client on app mount
        mounted: function () {

            /*
            //open a server socket, so that the platform process can send data to the UI
            let socket = new WebSocket("ws://"+ location.host.split(':')[0]+":18043/");

            //announce this socket to the platform process
            socket.onopen = () => {
                let message = (new Date()).toISOString() + "|*|UI|*|Startup|*|UI now connected via Websocket";
                socket.send(message);
            };

            socket.onmessage = (event) => {
                // Vue data binding means we don't need any extra work to
                // update the UI. Anytime a variable is updated from here the UI will follow
                //console.log("recieved data", event);
                let messageArray = event.data.toString().split("|*|");
                let timestamp = messageArray[0]; //First argument is timestamp 
                this.timestampObj = timestamp
                let dataKey = messageArray[1]; // second is the data key assocated with the incoming data
                try {
                    let dataContent = JSON.parse(messageArray[2]); // Third is an array of objects holding data
                    this.incomingDataObj[dataKey] = dataContent;
                } catch (err) {
                    console.log((new Date()).toISOString(),'[ERROR] {App.vue} Error Parsing JSON Msg: ' + messageArray[2] + '. Error = ' + err.stack)
                }
            };

            socket.onclose = (event) => {
                console.log((new Date()).toISOString(),'[ERROR] {App.vue} websocket connection closed', event);
            };
            */
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
        background-color: rgba(247, 244, 244, 0.918);
        height: 100%;
        width: 100vw;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-areas: 
        'header'
        'body';
        margin-top: -8px;
        margin-left: -8px;
        color: black;
    }
    
    .logo {
        height: 60px;
    }

</style>
  

