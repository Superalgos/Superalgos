<template>
    <div class="app-container">
        <div class="nav-bar">
            <img class="logo" :src="logo" >
            <button class="nav-btn" @click="openMenu">Dashboards</button>
            <button class="nav-btn" @click="openSettings">Settings</button>
        </div>
        <Drawer class="drawer-theme" :direction="'left'" :exist="true" ref="LeftDrawer">
            <img class="logo" :src="logo" >
            <div class="dash-link-container" v-for="dashboard in dashboards">
                <router-link class="dash-link" :to="{ name: dashboard.name }" >{{dashboard.name}} Dashboard</router-link>
            </div>
        </Drawer>
        <Drawer class="drawer-theme" :direction="'right'" :exist="true" ref="RightDrawer">Settings Coming Soon!</Drawer>
        <router-view class="dashboard-view" :incomingData="incomingDataObj" :timestamp="timestampObj"></router-view>
    </div>
</template>

<script>
    import Drawer from './components/Drawer.vue'
    import logo from "./assets/superalgos-logo-white.png"
    import background from "./assets/superalgos-header-background.png"

    export default {
        components: { Drawer },
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
			}
        },
        // Spin up websocket client on app mount
        mounted: function () {
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
        },
    }
</script>

<style>
    ::-webkit-scrollbar {
        width: 5px;
    }

    ::-webkit-scrollbar-thumb {
    background: #888;
    }

    ::-webkit-scrollbar-track {
    background: #f1f1f1;
    }

    .app-container {
        font:400 17px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        background: #f1f1f1;
        height: calc(100vh - 50px);
    }
    
    .nav-bar {
        position:fixed; 
        left:0;           
        top:0;            
        width:100vw;      
        z-index:200;  
        height:50spx;  
        background-image: url('~./assets/superalgos-header-background.png');
        display: flex; 
    }

    .logo {
        height: 50px;
    }

    .nav-btn {
        font-size: 16px;
        color: white;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
        background-color: transparent;
        border: none;
    }

    .nav-btn:hover {
        font-size: 16px;
        color: white;
        background-color: rgba(51, 51, 51, 0.7);
    }

    .dash-link-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .dash-link{
        color: white;
        border-style: solid;
        border-width: 1px;
        border-radius: 6px;
        padding: 10px;
        width: 80%;
        text-decoration: none;
    }

    .dash-link:hover {
        background-color: rgba(227, 73, 60, 0.5);
    }

    .dashboard-view {
        margin-top: 50px;
    }
</style>
  

