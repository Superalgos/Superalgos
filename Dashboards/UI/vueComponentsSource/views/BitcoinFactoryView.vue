<template>
  <div class="dashboard-window container-fluid">
    <div class="row col-12">
      <div  class="col-3">
        <img class="image" :src="dashboardIcon">
      </div>
      <div  class="col-9">
        <h2><strong>Welcome to the Superalgos Bitcoin-Factory Dashboard!</strong></h2>
      </div>
    </div>
    <div class="row col-12">
      <Tabs :tabList="tabList">
        <template v-slot:tabPanel-1>
          <div v-html="getOverview"></div>
          <div class="empty" v-if="serverObj.length === 0"> Bitcoin-Factory Server hasn't provided any data up to now! </div>        
        </template>
        <template v-slot:tabPanel-2>
          <div>
            <Table :fields="getServerColName" :data="getServerData"></table>
          </div>
          <div class="empty" v-if="serverObj.length === 0"> Bitcoin-Factory Server hasn't provided any data up to now! </div>        
        </template>
        <template v-slot:tabPanel-3>
          <div v-for="(objs) in getForecaster()">
            <Table :fields="getForecasterColName" :data="getForecasterData"></table>
          </div>
          <div class="empty" v-if="forecasterObj.length === 0"> Bitcoin-Factory Forecaster hasn't provided any data up to now! </div>        
        </template>
      </Tabs>
    </div>
    <div  class="row col-12">
      <span v-if="getTimestamp !== ''">Last update: {{ getTimestamp }}</span>
    </div>    
  </div>
</template>

<script>
  import dashboardIcon from "../assets/dashboard.png"
  import Tabs from "../components/Tabs.vue"
  import ExpandableTree from "../components/expandableTree.vue"
  import Table from '../components/Table.vue'
  import "bootstrap/dist/css/bootstrap.min.css";

  export default {
    // Receive incoming data from parent app 
    props: ["incomingData", "timestamp"] ,
    components: { Tabs, ExpandableTree, Table } ,
    data () {
      return {
        tabList: ["Overview", "Server", "Forecaster"],
        dataKey: 'Platform-BitcoinFactory',
        dashboardIcon: dashboardIcon,
        serverObj: [],
        forecasterObj: [],    
      }
    },
    computed: {
      getTimestamp () {
        return this.timestamp
      },
      getOverview() {
        let data = this.getServer()
        let TotalTestCases = 0
        let DoneCases = 0
        let AssignedCases = 0
        let ParticipatingUsers = []
        let SumCalcTime = 0
        if ((data !== undefined) && (data[0] !== undefined)) {
          TotalTestCases = data[0].length
          for(let item of data[0]) {
            if (item.enlapsedHours !== undefined) {
              DoneCases++
              SumCalcTime += Number(item.enlapsedHours)
            }
            if (item.assignedTimestamp !== undefined &&
                item.enlapsedHours == undefined) AssignedCases++
            if ( !(ParticipatingUsers.includes(item.testedByProfile)) ) ParticipatingUsers.push(item.testedByProfile)

          }
        }
        let Forecasterdata = this.getForecaster()
        let TotalForecasterCases = 0
        let AssignedForecasterCases = 0

        if ((Forecasterdata !== undefined) && (Forecasterdata[0] !== undefined)) {
          TotalForecasterCases = Forecasterdata[0].length
          for(let item of Forecasterdata[0]) {
            if (item.assignedTimestamp !== undefined &&
                item.enlapsedHours == undefined) AssignedForecasterCases++
          }
        }
        let html = '<div class="row">'
        html += '<div class="col-6">'
        html += "<p>Number of total Testcases: "+TotalTestCases+"</p>" 
        html += "<p>Number of calculated Testcases: "+DoneCases+"</p>" 
        html += "<p>Number of assigned but unfinished Testcases: "+AssignedCases+"</p>" 
        html += "<p>Number of participating Users: "+ParticipatingUsers.length+"</p>" 
        html += "<p>Average Calculation Time (hs): "+(SumCalcTime/DoneCases).toFixed(2)+"</p>" 
        html += '</div>'
        html += '<div class="col-6">'
        html += '<p>Number of Forecast Cases: '+TotalForecasterCases+'</p>'
        html += '<p>Number of assigned but unfinished Forecast Cases: '+AssignedForecasterCases+'</p>'
        html += '</div>'
        html += '</div>'
        return html
      },
      getServerColName () {
        let data = this.getServer() 
        if ((data !== undefined) && (data[0] !== undefined)) {
          let res = []
          for(let item of data[0]) {
            for(let key in item) {
              if ( !(res.includes(key)) &&
                 key !== 'parametersHash' &&
                 key !== 'timeSeriesFileName' &&
                 key !== 'parametersFileName' &&
                 key !== 'testedByProfile' &&
                 key !== 'enlapsedSeconds' &&
                 key !== 'enlapsedMinutes' &&
                 key !== 'testedByInstance' 
                 ) {
                res.push(key)
              }
            }
          }
          return res
        } 
        return null
      },      
      getServerData () {
        let data = this.getServer() 
        if ((data !== undefined) && (data[0] !== undefined)) {
          let res = []
          for(let item of data[0]) {
            delete item.parametersHash
            delete item.timeSeriesFileName
            delete item.testedByProfile
            delete item.enlapsedSeconds
            delete item.enlapsedMinutes
            delete item.testedByInstance            
            delete item.parametersFileName
            delete item.parameters.LIST_OF_ASSETS
            delete item.parameters.LIST_OF_TIMEFRAMES
            if (item.testServer !== undefined && item.testServer.instance !== undefined) {
              item.testServer = item.testServer.instance
            }
            if (item.filesTimestaps !== undefined  && item.filesTimestaps.parameters !== undefined) {
              item.filesTimestaps = new Date(item.filesTimestaps.parameters).toUTCString()
            }       
            if (item.assignedTimestamp !== undefined) {
              item.assignedTimestamp = new Date(item.assignedTimestamp).toUTCString() 
            } 
            if (item.timestamp !== undefined) {
              item.timestamp = new Date(item.timestamp).toUTCString() 
            }                   
            if (item.forcastedCandle !== undefined && item.forcastedCandle.close == undefined) {
              item.forcastedCandle = 'N/A'
            }
            for (let param in item.parameters) {
              if (item.parameters[param] == 'OFF') delete item.parameters[param]
            }
            console.log("item: ",item.parameters)
            res.push(item)
          }
          return res
        }
        return null
      },
      getForecasterColName () {
        let data = this.getForecaster() 
        if ((data !== undefined) && (data[0] !== undefined)) {
          let res = []
          for(let item of data[0]) {
            for(let key in item) {
              if ( !(res.includes(key)) &&
                 key !== 'parametersHash' &&
                 key !== 'caseIndex' &&
                 key !== 'timeSeriesFileName') {
                res.push(key)
              }
            }
          }
          return res
        } 
        return null
      },      
      getForecasterData () {
        let data = this.getForecaster() 
        if ((data !== undefined) && (data[0] !== undefined)) {
          let res = []
          for(let item of data[0]) {
            delete item.parametersHash
            delete item.caseIndex
            delete item.timeSeriesFileName
            delete item.parameters.LIST_OF_ASSETS
            delete item.parameters.LIST_OF_TIMEFRAMES
            if (item.testServer !== undefined && item.testServer.instance !== undefined) {
              item.testServer = item.testServer.instance
            }
            if (item.forcastedCandle !== undefined && item.forcastedCandle.close == undefined) {
              item.forcastedCandle = 'N/A'
            }
            if (item.timestamp !== undefined) {
              item.timestamp = new Date(item.timestamp).toUTCString() 
            }                   
            for (let param in item.parameters) {
              if (item.parameters[param] == 'OFF') delete item.parameters[param]
            }
            res.push(item)
          }
          return res
                 return [
          {id: 1, desc: "tt"},
         {id: 2, desc: "ssss"} ]
        }
        return null
      }
    },
    methods: {
      getServer () {
        this.serverObj = []
        let key = this.dataKey + '-Server'
        if (key in this.incomingData) {
          for(let dataObject of this.incomingData[key]) {
            this.serverObj.push(dataObject)
          }
        }
        return this.serverObj        
      },   
      getForecaster () {
        this.forecasterObj = []
        let key = this.dataKey + '-Forecaster'
        if (key in this.incomingData) {
          for(let dataObject of this.incomingData[key]) {
            this.forecasterObj.push(dataObject)
          }
        }
        return this.forecasterObj        
      }
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