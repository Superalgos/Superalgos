<template>
  <div class="dashboard-window">
    <img class="image" :src="dashboardIcon">
    <span>this is our loaded persona {{ socialPersona }}</span>
    <h2><strong>Welcome to the Superalgos Dashboard App!</strong></h2>
    <br/>
    <span>The purpose of this app is to help make visualizing and accessing data from Superalgos a breeze.</span>
  </div>
</template>

<script>
  import dashboardIcon from "../assets/dashboard.png"
  import { getFeed } from "../api/post.httpService.js"
  import { getSocialPersona } from "../api/profile.httpService.js"
  export default {
    // Receive incoming data from parent app 
    props: ["incomingData"],
 
    data () {
      return {
        dataKey: '',
        dataObjects: [],
        dashboardIcon: dashboardIcon,
        feed: undefined,
        socialPersona: undefined
      }
    },
    computed: {
    },
    methods: {
      getSocialPersona () {
        getSocialPersona().then(data => {
                    return data.json()

                }).then( socialPersona => {
                    console.log('this is our loaded Social Persona', socialPersona)
                    this.socialPersona = socialPersona
                })
        },
        getUserFeed () {
                getFeed().then(data => {
                    return data.json()
                    
                }).then( feed => {
                    console.log('this is our feed', feed)
                    this.response = feed
                })
        }
    }, 
    mounted: function () {
      this.getSocialPersona()
    }, 
  };
</script>

<style scoped>
  .dashboard-window {
    font-size: bold;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .image {
    margin-top: 10px;
    height: 100px;
  }
</style>

