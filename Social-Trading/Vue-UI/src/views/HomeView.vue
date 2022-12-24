<template>
<div class="container">
  <div class="sliding-background grid" :style="homepagebackground">
      <div id="platform-div" class="tile-btn" v-on:click="launchPlatform">
        <h1 id="platform">Launch Platform</h1>
      </div>
      <div id="social-trading-div" class="tile-btn" v-on:click="startSocialTrading">
        <h1 id="social-trading-btn">Start Social Trading</h1>
      </div>
      <div id="machine-learning-div" class="tile-btn" v-on:click="startBitcoinFactory">
        <h1 id="bitcoin-factory-btn">Bitcoin Factory</h1>
      </div>
      <div id="docs-div" class="tile-btn" v-on:click="viewDocs" >
        <h1 id="docs-btn">View Docs</h1>
      </div>
      <div id="map-div" class="tile-btn" v-on:click="viewMap" >
          <h1 id="map-btn">Open Map</h1>
      </div>
      <div id="charting-space-btn-div" class="tile-btn" v-on:click="openChartingSpace">
        <h1 id="charting-space-btn">Charting Space</h1>
      </div>
      <div id="governance-btn-div" class="tile-btn" v-on:click="openGovernance">
        <h1 id="governance-btn">Governance</h1>
      </div>
      <div id="profile-btn-div" class="tile-btn" v-on:click="viewProfile">
        <h1 id="profile-btn">My Profile</h1>
      </div>
      <div>this is our loaded persona {{ socialPersona }}</div>
  </div>
</div>
</template>

<script>
  import dashboardIcon from "../assets/dashboard.png"
  import { getFeed } from "../api/post.httpService.js"
  import { getSocialPersona } from "../api/profile.httpService.js"
  
  export default {
    name: 'Home',
  components: { },
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
      launchPlatform() {
        alert("This feature is still under construction - Coming Soon!")
      },
      startSocialTrading() {
        this.$router.push('/social-trading')
      },
      startBitcoinFactory() {
        alert("This feature is still under construction - Coming Soon!")
      },
      viewProfile() {
        this.$router.push('/profile')
      },
      viewMap() {
        window.location.href = "https://superalgos.gogocarto.fr/";
      },
      viewDocs() {
        window.location.href = "https://superalgos.org/Docs/Foundations/Book/user-manual.shtml";
      },
      openChartingSpace() {
        alert("This feature is still under construction - Coming Soon!")
      },
      openGovernance() {
        alert("This feature is still under construction - Coming Soon!")
      },  
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

/* Background */

  .container {
    position: relative;
    overflow: hidden;
    color: white;
  }

  .sliding-background {
    position: fixed;
    background: url('../assets/homepagebackground.jpg') repeat-x 0 / 100% auto;
    top: 1%;
    left: 0%;
    width: 100vw;
    height: 100vh;
    animation: slide 80s linear infinite;
    transition: all .1s ease-out;
}

@keyframes slide {
    0%{background-position: 0, 0, 0, 0;}
	100%{background-position: 1692px, 0, 0;}
}


/* Setup the grid for buttons */
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-areas: 
    'platform social-trading map docs'
    'placeholder1 placeholder2 placeholder3 placeholder4';
    justify-self: center;
    align-content: center;
    height: 100vh;
    width: 100vw;
  }

  
/* Setup the Buttons */
  .tile-btn {
    display: flex;
    border: solid 2px rgb(80, 180, 211);
    height: 20em;
    width: 20em;
    margin: 5%;
    justify-content: center;
    align-items: center;
    background: rgba(24, 25, 26, 0.527);
    justify-self: center;
    align-self: center;
    cursor: pointer;
    border-radius: 30px;
  }

/* Handle the button hover */
  .tile-btn:hover {
    color: white;
    background-color: rgba(51, 51, 51, 0.726);
    height: 20em;
    width: 20em;
    border: solid 6px rgb(80, 180, 211);
    }


    #social-trading-div {
      text-align: center;
    }





a {
  text-decoration: none
}

.nav-bar {
  position: fixed;
}


</style>

