<template>
  <div class="dashboard-window">
    <img class="image" :src="dashboardIcon">
    <h2><strong>Welcome to the Superalgos Dashboard App!</strong></h2>
    <br/>
    <span>The purpose of this app is to help make visualizing and accessing data from Superalgos a breeze.</span>
  </div>
</template>

<script>
  import dashboardIcon from "../assets/dashboard.png"
  export default {
    // Receive incoming data from parent app 
    props: ["incomingData"],
 
    data () {
      return {
        dataKey: '',
        dataObjects: [],
        dashboardIcon: dashboardIcon,
      }
    },
    computed: {
    },
    methods: {
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

