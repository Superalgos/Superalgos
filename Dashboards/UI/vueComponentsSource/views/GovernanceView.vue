<template>
    <div class="dashboard-window container-fluid">
      <div class="row col-12">
        <div  class="col-3">
          <img class="image" :src="dashboardIcon">
        </div>
        <div class="col-6 mt-4 text-center">
          <h2><strong>Welcome to the Superalgos Governance Dashboard!</strong></h2>
          <h5>Manage your SA tokens and control the distribution program from one place!</h5>
        </div>
      </div>
      <div class="row col-12 justify-content-end">
        <div class="col-auto">
          <button class="btn btn-primary m-2">Create User Profile</button>
          <button class="btn btn-primary m-2" @click="connectWallet">Connect your Wallet</button>
        </div>
      </div>
      <div class="row col-12">
        <Tabs :tabList="tabList">
          <template v-slot:tabPanel-1>
            <div v-html="getOverview"></div>
            <div class="empty" v-if="userObj.length === 0"> No data provided up to now! </div>
            <div class="row col-3">
              <button class="btn btn-primary mb-2" @click="buyToken1">Buy SA Tokens on PancakeSwap (0xfb981ed9a92377ca4d75d924b9ca06df163924fd)</button>
              <button class="btn btn-primary mb-2" @click="buyToken2">Buy SA Tokens on 1inch (0xc17272c3e15074c55b810bceba02ba0c4481cd79)</button>
            </div>
          </template>
          <template v-slot:tabPanel-2>
            <div class="row col-2">
              <button class="btn btn-primary mb-2">Add Stacking Program</button>
              <button class="btn btn-primary mb-5">Delete Stacking Program</button>
              <button class="btn btn-primary">Contribute Changes</button>
            </div>
            <div>
              <Table :fields="getStakingColName" :data="getStackingData"></table>
            </div>
            <div class="empty" v-if="stackObj.length === 0"> No data provided up to now! </div>        
          </template>
          <template v-slot:tabPanel-3>
            <div class="row col-2">
              <button class="btn btn-primary mb-2">Add Liquidity Program</button>
              <button class="btn btn-primary mb-5">Delete Liquidity Program</button>
              <button class="btn btn-primary">Contribute Changes</button>
            </div>
            <div>
              <Table :fields="getLiquidityColName" :data="getLiquidityData"></table>
            </div>
            <div class="empty" v-if="liqObj.length === 0"> No data provided up to now! </div>        
          </template>
          <template v-slot:tabPanel-4>
            <div class="row col-2">
              <button class="btn btn-primary mb-2">Add Referral Program</button>
              <button class="btn btn-primary mb-5">Delete Referral Program</button>
              <button class="btn btn-primary">Contribute Changes</button>
            </div>
            <div>
              <Table :fields="getReferralColName" :data="getReferralData"></table>
            </div>
            <div class="empty" v-if="refObj.length === 0"> No data provided up to now! </div>        
          </template>
          <template v-slot:tabPanel-5>
            <div>
              <div class="row col-12 justify-content">
                <div v-for="(objs) in getDistributionData">
                <ExpandableTree v-for="(value, name) in objs" :value="value" :name="name" :key="name" :depth="0"></ExpandableTree>
            </div>
              </div>
            </div>
            <div class="empty" v-if="userObj.length === 0"> No data provided up to now! </div>        
          </template>
          <template v-slot:tabPanel-6>
            <div>
              <div class="row col-12 justify-content">
                <div class="col-auto">
                  <button class="btn btn-primary m-2">Profiles</button>
                  <button class="btn btn-primary m-2">Airdrop</button>          
                  <button class="btn btn-primary m-2">GitHub</button>
                  <button class="btn btn-primary m-2">Referrals</button>
                  <button class="btn btn-primary m-2">Supporters</button>
                  <button class="btn btn-primary m-2">Mentors</button>
                  <button class="btn btn-primary m-2">Influencers</button>
                  <button class="btn btn-primary m-2">Claims</button>
                  <button class="btn btn-primary m-2">Votes</button>
                  <button class="btn btn-primary m-2">Staking</button>
                  <button class="btn btn-primary m-2">Liquidity</button>
                  <button class="btn btn-primary m-2">Delegation</button>
                  <button class="btn btn-primary m-2">Assets</button>
                  <button class="btn btn-primary m-2">Features</button>
                  <button class="btn btn-primary m-2">Mining</button>
                  <button class="btn btn-primary m-2">Computing</button>
                </div>
                <div v-for="(objs) in getDistributionData">
                <ExpandableTree v-for="(value, name) in objs" :value="value" :name="name" :key="name" :depth="0"></ExpandableTree>
            </div>
              </div>
            </div>
            <div class="empty" v-if="distrObj.length === 0"> No data provided up to now! </div>        
          </template>

        </Tabs>
      </div>
      <div  class="row col-12">
        <div class="col-6" v-if="getTimestamp !== ''">Last update: {{ getTimestamp }}</div><div class="col-6" v-if="host !== ''">Runnning on: {{ host }}</div>
      </div>
    </div>
  </template>
  
  <script>
    import dashboardIcon from "../assets/dashboard.png";
    import ExpandableTree from "../components/expandableTree.vue";
    import Tabs from "../components/Tabs.vue"
    import Table from '../components/Table.vue'
    import "bootstrap/dist/css/bootstrap.min.css";
  
    export default {
      // Receive incoming data from parent app 
      props: ["incomingData", "timestamp"] ,
      components: { Tabs, Table, ExpandableTree} ,
      data () {
        return {
          tabList: ["Overview", "Staking Programs", "Liquidity Programs", "Referrals Program", "Contributors", "Distribution Report"],
          dataKey: 'Platform-Governance',
          dashboardIcon: dashboardIcon,
          userObj: [],
          distrObj: [],
          stackObj: [], 
          liqObj: [],
          refObj: [],     
          host: location.host.split(':')[0]
        }
      },
      computed: {
        /*
        To-DO: Computed functions for each Tab panel (Stacking,Liquidity, Referrals, Contrubutors and Distribution)
        */
        getTimestamp () {
          return this.timestamp
        },
        getOverview() {
          
          let data = this.userObj[0];
          let UserBalance = 0;
          let UserWallet = [];
          let TokenPower = 0;
          let AllocatedToken = 0;
          let StackReward = 0;
          let pStackReward = 0;
          let LiquidReward = 0;
          let pLiquidReward = 0;
          let TotalReward = 0;
          let pTotalReward = 0;

          if ((data !== undefined) && (data[0] !== undefined)) {
            UserBalance = data.SAbalance;
            UserWallet = data.wallet;
            TokenPower = data.TokenPower;
          }

          let html = '<div class="row">'
          html += '<div class="col-4">'
          html += "<p>User Blockchain Wallet: "+ UserWallet +"</p>" 
          html += "<p>User Token Balance: "+ UserBalance +"</p>" 
          html += "<p>Token Power Available: "+TokenPower+"</p>" 
          html += "<p>Allocated Token Power: "+AllocatedToken+"</p>"
          html += '</div>' 
          html += '<div class="col-4">'
          html += "<p>Last Distribution Staking Reward: "+StackReward+"</p>"
          html += "<p>Last Distribution Liquidity Reward: "+LiquidReward+"</p>"
          html += "<p>Last Distribution Total Reward: "+TotalReward+"</p>" 
          html += '</div>'
          html += '<div class="col-4">'
          html += "<p>Estimated Current Distribution Staking Reward: "+pStackReward+"</p>"
          html += "<p>Estimated Current Distribution Liquidity Reward: "+pLiquidReward+"</p>"
          html += "<p>Estimated Current Distribution Total Reward: "+pTotalReward+"</p>" 
          
          return html
        },     
        getDistributionColName () {
          let data = this.getDistribution() 
          if ((data !== undefined) && (data[0] !== undefined)) {
            let res = []
            
            return res
          } 
          return null
        },      
        getDistributionData () {
          let data = this.getDistribution() 
          let dataString = JSON.parse(data)

          return dataString
        }
      },
      methods: {
        /* 
        To-DO: Function to catch -UserInfo messages
        */
        getUserInfo(){
          this.userObj = []
          let key = this.dataKey + '-UserInfo'
          if (key in this.incomingData) {
            for(let dataObject of this.incomingData[key]) {
              this.userObj.push(dataObject)
            }
          }
          return this.userObj
        },
        /* 
        To-DO: Function to catch -Stacking messages
        */
        getStacking () {
          this.stackObj = []
          let key = this.dataKey + '-Stacking'
          if (key in this.incomingData) {
            for(let dataObject of this.incomingData[key]) {
              this.stackObj.push(dataObject)
            }
          }
          return this.stackObj        
        },  
        /* 
        To-DO: Function to catch -Distribution messages
        */ 
        getDistribution () {
          this.distrObj = []
          let key = this.dataKey + '-UserInfo'
          if (key in this.incomingData) {
            for(let dataObject of this.incomingData[key]) {
              this.distrObj.push(dataObject)
            }
          }
          return this.distrObj        
        },
        /* 
        To-DO: Function to catch -Liquidity messages
        */
        getLiquidity () {
          this.liqObj = []
          let key = this.dataKey + '-Liquidity'
          if (key in this.incomingData) {
            for(let dataObject of this.incomingData[key]) {
              this.liqObj.push(dataObject)
            }
          }
          return this.liqObj        
        },
         /* 
        To-DO: Function to catch -Referral messages
        */
        getReferral () {
          this.refObj = []
          let key = this.dataKey + '-Referral'
          if (key in this.incomingData) {
            for(let dataObject of this.incomingData[key]) {
              this.refObj.push(dataObject)
            }
          }
          return this.refObj        
        },
        /* 
        To-DO: Function to Connect a Web3 wallet
        */
        /*
        connectWallet: async function() {
          
        },
        */
        /* 
        To-DO: Function to Create new User Profile
        */
        /* 
        To-DO: Function for Contribute changes button on User Profile
        */
        /* 
        Urls to buy Tokens from Pankcake, 1Inch and Superalgos Webpage
        */
        buyToken1 () {
          window.open('https://pancakeswap.finance/info/token/0xfb981ed9a92377ca4d75d924b9ca06df163924fd', '_blank') 
        },
        buyToken2 () {
          window.open('https://app.1inch.io/#/1/simple/swap/USDT/SA', '_blank') 
        },
        mainPage () {
          window.open('https://superalgos.org/index.shtml', '_blank')
        }
      },
    }  
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