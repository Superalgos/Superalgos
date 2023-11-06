const os = require('os')
const child_process = require('child_process')
const {newEnvironment} = require("../Environment")

const fatalErrorHelp = () => {
  console.log('')
  console.log('* If your device does not have MORE than 8GB of RAM then please use the minMemo option.')
  console.log('* Do not use this app if your OS does not have a user interface.')
  console.log('')
  console.log('If you continue having trouble starting the Superalgos Dashboards Client try:')
  console.log('')
  console.log('node dashboards minMemo')
  return 'fatal error help message displayed'
}

const runDashboards = () => {
  if (
    process.argv.includes("help") ||
    process.argv.includes("-help") ||
    process.argv.includes("--help") ||
    process.argv.includes("h") ||
    process.argv.includes("-h") ||
    process.argv.includes("--h") ||
    process.argv.includes("/h") ||
    process.argv.includes("/help")) {

    console.log('Superalgos Dashboard App')
    console.log('')
    console.log('VERSION:               ' + require('../package.json').version)
    console.log('')
    console.log('WEB:                   https://www.superalgos.org')
    console.log('')
    console.log('GITHUB:                https://www.github.com/Superalgos')
    console.log('')
    console.log('TELEGRAM COMMUNITY:    https://t.me/superalgoscommunity')
    console.log('')
    console.log('USAGE:                 node dashboards [options]')
    console.log('')
    console.log('OPTIONS:')
    console.log('')
    console.log('                       help:        Optional. Use it to see this helping information.')
    console.log('                       minMemo:     Optional. Use it when your hardware has less than 8 Gb or memory.')
    console.log('                       devBackend:  Optional. Use it when you want to only start the backend of the app.')
    console.log('                       devFrontend: Optional. Use it when you want to only start the UI of the app.')
    console.log('')

    return 'help message has been displayed'
  }

  let totalRAM = os.totalmem() // Get total ram installed
  totalRAM = totalRAM / 1024 / 1024
  let optimalRAM = totalRAM * 0.15 // Use 15% of installed RAM
  let maxOldSpaceSize = "--max-old-space-size=" + (optimalRAM.toFixed(0)).toString()
  let options

  console.log('')
  console.log("Total RAM installed in this system is ........................ " + (totalRAM / 1024).toFixed(2) + " GB")
  if (process.argv.includes("minMemo")) {
    options = {
        stdio: 'inherit'
    }
    console.log("Total RAM available for Superalgos Dashboards App is ....................... 512 MB")
  } else {
    options = {
        execArgv: [maxOldSpaceSize],
        stdio: 'inherit'
    }
    console.log("Total RAM available for Superalgos Dashboard App is ....................... " + (optimalRAM / 1024).toFixed(2) + " GB")
    console.log('')
    console.log('If you would like to enable less RAM than that, use the minMemo flag. Note: RAM will be allocated only if needed.')
  }
  console.log('')
  console.log('OPTIONS ACCEPTED:')
  console.log('')
  let optionsAccepted = 0

  if (process.argv.includes("minMemo")) {
    optionsAccepted++
    console.log('minMemo ..................................................... Running with Minimun Required Memory.')
  } 
  if (process.argv.includes("devBackend")) {
    optionsAccepted++
    console.log('devBackend ..................................................... Running with Backend Only.')
  } 
  if (process.argv.includes("devFrontend")) {
    optionsAccepted++
    console.log('devFrontend ..................................................... Running with Frontend Only.')
  } 
  if (optionsAccepted === 0) {
    console.log('none ........................................................ Running without any command line options.')
  }

  console.log('')
  console.log('')

  const fs = require('fs')
  const path = './node_modules'
  if ( fs.existsSync(path) ) {
    try {
        child_process.fork('./DashboardsRoot.js', process.argv, options)
        return 'client running'
    } catch (err) {
        console.log('')
        console.log('Failed to create Superalgos Dashboards Client Process.')
        console.log('')

        fatalErrorHelp()
        return 'client error'
    }
  } else {
    console.log('')
    console.log('[ERROR] node_modules does not exist. Try running "node setup" to solve this issue. Then try again. You can finded detailed instructions for this in the ReadMe.')
    console.log('')
  }

}

function getDashboardPort(){
  const envParamters = newEnvironment();
  return envParamters.DASHBOARDS_WEB_SOCKETS_INTERFACE_PORT;
}

function checkDashboardStatus() {
  return new Promise(resolve=>{
      let net = require('net')
      net.connect(getDashboardPort(),()=>{
        resolve(true)
      })
      .addListener("error",err=>{
          resolve(false)
      })
  })
}
function runFirstDashboards(callback){
  checkDashboardStatus().then(dashboardIsActive=>{
    if(dashboardIsActive)
        setTimeout(()=>callback(),1000)
    else{ 
        runDashboards()
        setTimeout(()=>runFirstDashboards(callback),1000)
    }
})
}

module.exports = {
  runDashboards,
  fatalErrorHelp,
  checkDashboardStatus,
  getDashboardPort,
  runFirstDashboards
}
