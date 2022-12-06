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
          <div>
            <Table :fields="getForecasterColName" :data="getForecasterData"></table>
          </div>
          <div class="empty" v-if="forecasterObj.length === 0"> Bitcoin-Factory Forecaster hasn't provided any data up to now! </div>        
        </template>
      </Tabs>
    </div>
    <div  class="row col-12">
      <div class="col-6" v-if="getTimestamp !== ''">Last update: {{ getTimestamp }}</div><div class="col-6" v-if="host !== ''">Runnning on: {{ host }}</div>
    </div>    
  </div>
</template>

<script>
  import dashboardIcon from "../assets/dashboard.png"
  import Tabs from "../components/Tabs.vue"
  import Table from '../components/Table.vue'
  import "bootstrap/dist/css/bootstrap.min.css";

  export default {
    // Receive incoming data from parent app 
    props: ["incomingData", "timestamp"] ,
    components: { Tabs, Table } ,
    data () {
      return {
        tabList: ["Overview", "Server", "Forecaster"],
        dataKey: 'Platform-BitcoinFactory',
        dashboardIcon: dashboardIcon,
        serverObj: [],
        forecasterObj: [],    
        host: location.host.split(':')[0]
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
        let OutdatedForecasterCases = 0

        let ForecasterBestModel = []

        if ((Forecasterdata !== undefined) && (Forecasterdata[0] !== undefined)) {
          TotalForecasterCases = Forecasterdata[0].length
          OutdatedForecasterCases = TotalForecasterCases

          for(let item of Forecasterdata[0]) {
            if (item.assignedTimestamp !== undefined &&
                item.status !== 'Forecasted') AssignedForecasterCases++
            let mtf = item.mainTimeFrame.split('-')

            let mtfMinutes = mtf[1] === 'hs' ? Number(mtf[0])*60 : Number(mtf[0]) 

            if ((item.status === 'Forecasted') &&
              (new Date() - new Date(item.timestamp)) < 1000 * 60 * mtfMinutes) {
                OutdatedForecasterCases--
                ForecasterBestModel[ForecasterBestModel.length] = []
                ForecasterBestModel[ForecasterBestModel.length-1]['ID'] = item.id
                ForecasterBestModel[ForecasterBestModel.length-1]['ratio_validate'] = Number(item.ratio_validate)
                ForecasterBestModel[ForecasterBestModel.length-1]['action'] = []
                ForecasterBestModel[ForecasterBestModel.length-1]['action']['type'] = item.predictions.type
                switch (item.predictions.type) {
                  case 0:
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['desc'] = "Buy Long @ Market"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['amount'] = item.predictions.amount + " %"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['limit'] = ""
                    break;

                  case 1:
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['desc'] = "Sell Long @ Market"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['amount'] = item.predictions.amount + " %"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['limit'] = ""
                    break;

                  case 2:
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['desc'] = "Buy Long @ Limit"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['amount'] = item.predictions.amount + " %"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['limit'] = item.predictions.limit + " %"
                    break;

                  case 3:                                                            
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['desc'] = "Sell Long @ Limit"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['amount'] = item.predictions.amount + " %"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['limit'] = item.predictions.limit + " %"
                    break;

                  case 4:
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['desc'] = "Buy Short @ Market"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['amount'] = item.predictions.amount + " %"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['limit'] = ""
                    break;

                  case 5:
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['desc'] = "Sell Short @ Market"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['amount'] = item.predictions.amount + " %"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['limit'] = ""
                    break;

                  case 6:
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['desc'] = "Buy Short @ Limit"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['amount'] = item.predictions.amount + " %"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['limit'] = item.predictions.limit + " %"
                    break;

                  case 7:
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['desc'] = "Sell Short @ Limit"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['amount'] = item.predictions.amount + " %"
                    ForecasterBestModel[ForecasterBestModel.length-1]['action']['limit'] = item.predictions.limit + " %"
                    break;

                  default:                                                            
                }
                ForecasterBestModel[ForecasterBestModel.length-1]['validUntil'] = new Date(item.timestamp+1000 * 60 * mtfMinutes).toUTCString()
            }
          }
        }
        let html = '<div class="row">'
        html += '<div class="col-4">'
        html += "<p>Number of total Testcases: "+TotalTestCases+"</p>" 
        html += "<p>Number of calculated Testcases: "+DoneCases+"</p>" 
        html += "<p>Number of assigned but unfinished Testcases: "+AssignedCases+"</p>" 
        html += "<p>Number of participating Users: "+ParticipatingUsers.length+"</p>" 
        html += "<p>Average Calculation Time (hs): "+(SumCalcTime/DoneCases).toFixed(2)+"</p>" 
        html += '</div>'
        html += '<div class="col-4">'
        html += '<p>Number of Forecast Cases: '+TotalForecasterCases+'</p>'
        html += '<p>Number of assigned but unfinished Forecast Cases: '+AssignedForecasterCases+'</p>'
        html += '<p>Number of outdated Forecast Cases: '+OutdatedForecasterCases+'</p>'
        html += '</div>'
        html += '<div class="col-4">'
        if (ForecasterBestModel.length > 0) {   
          ForecasterBestModel.forEach((model) =>  {
            html += '<div class="row col-12">'
            html += '<span>Model ID: '+model['ID']+'</span>'
            html += '<span>Validation Ratio: '+model['ratio_validate']+'</span>'
            html += '<span>Prediction '+model['action']['desc'] +'<br><ul>'
              html += '<li>Action: '+model['action']['type'] +'</li>'
              html += '<li>Amount: '+model['action']['amount'] +'</li>'
              html += '<li>Limit: '+model['action']['limit'] +'</li>'
            html += '</ul></span>'
            html += '<span>Valid Until: '+model['validUntil'] +'<br><br></span>'
            html += '</div>'
          })
        } else {
          html += '<p>No Prediction</p>'
        }
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
            if (item.forecastedCandle !== undefined && item.forecastedCandle.close == undefined) {
              item.forecastedCandle = 'N/A'
            }
            for (let param in item.parameters) {
              if (item.parameters[param] == 'OFF') delete item.parameters[param]
            }
            //console.log("item: ",item.parameters)
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
            if (item.forecastedCandle !== undefined && item.forecastedCandle.close == undefined) {
              item.forecastedCandle = 'N/A'
            }
            if (item.assignedTimestamp !== undefined) {
              item.assignedTimestamp = new Date(item.assignedTimestamp).toUTCString() 
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