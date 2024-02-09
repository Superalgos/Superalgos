const os = require('os')
const child_process = require('child_process')

const fatalErrorHelp = () => {
  console.log('')
  console.log('* If your device does not have MORE than 8GB of RAM then please use the minMemo option.')
  console.log('* If your OS does not have a user interface, please use the noBrowser option.')
  console.log('')
  console.log('If you continue having trouble starting the Superalgos Platform Client try:')
  console.log('')
  console.log('node platform minMemo noBrowser')
  return 'fatal error help message displayed'
}

const runPlatform = () => {
  if (
    process.argv.includes("help") ||
    process.argv.includes("-help") ||
    process.argv.includes("--help") ||
    process.argv.includes("h") ||
    process.argv.includes("-h") ||
    process.argv.includes("--h") ||
    process.argv.includes("/h") ||
    process.argv.includes("/help")) {

    console.log('Superalgos')
    console.log('')
    console.log('VERSION:               ' + require('../package.json').version)
    console.log('')
    console.log('WEB:                   https://www.superalgos.org')
    console.log('')
    console.log('GITHUB:                https://www.github.com/Superalgos')
    console.log('')
    console.log('TELEGRAM COMMUNITY:    https://t.me/superalgoscommunity')
    console.log('')
    console.log('USAGE:                 node platform [options] [project] [workspace]')
    console.log('')
    console.log('OPTIONS:')
    console.log('')
    console.log('                       help:        Optional. Use it to see this helpful information.')
    console.log('                       noBrowser:   Optional. Use it to launch Superalgos Platform Client only. The Superalgos Platform UI will not be loaded.')
    console.log('                       minMemo:     Optional. Use it when your hardware has less than 8 Gb or memory.')
    console.log('                       demoMode:    Optional. Use it to launch Superalgos in Demo Mode. Users will be able to use the UI but not run Tasks.')
    console.log('PROJECT:               The name of the project to load on startup. (use with workspace)')
    console.log('')
    console.log('WORKSPACE:             The name of the workspace to load on startup.')
    console.log('')
    console.log('If you are getting errors while trying to run the Superalgos Platform Client, consider this:')

    return 'help message has been displayed'
  }

  let totalRAM = os.totalmem() // Get total ram installed
  totalRAM = totalRAM / 1024 / 1024
  let optimalRAM = totalRAM * 0.85 // Use 85% of installed RAM
  let maxOldSpaceSize = "--max-old-space-size=" + (optimalRAM.toFixed(0)).toString()
  let options

  console.log('')
  console.log("Total RAM installed in this system is ....................... " + (totalRAM / 1024).toFixed(2) + " GB")
  if (process.argv.includes("minMemo")) {
    options = {
        stdio: 'inherit'
    }
    console.log("Total RAM available for Superalgos is ....................... 512 MB")
  } else {
    options = {
        execArgv: [maxOldSpaceSize],
        stdio: 'inherit'
    }
    console.log("Total RAM available for Superalgos is ....................... " + (optimalRAM / 1024).toFixed(2) + " GB")
    console.log('')
    console.log('If you would like to enable less RAM than that, use the minMemo flag. Note: RAM will be allocated only if needed.')
  }
  console.log('')
  console.log('OPTIONS ACCEPTED:')
  console.log('')
  let optionsAccepted = 0

  if (process.argv.includes("minMemo")) {
    optionsAccepted++
    console.log('minMemo ..................................................... Running with Minimum Required Memory.')
  } 
  if (process.argv.includes("noBrowser")) {
    optionsAccepted++
    console.log('noBrowser ................................................... Running without User Interface.')
  }
  if (process.argv.includes("demoMode")) {
    optionsAccepted++
    console.log('demoMode .................................................... Running without User Interface.')
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
        child_process.fork('./PlatformRoot.js', process.argv, options)
        return 'client running'
    } catch (err) {
        console.log('')
        console.log('Failed to create Superalgos Platform Client Process.')
        console.log('')

        fatalErrorHelp()
        return 'client error'
    }
  } else {
    console.log('')
    console.log('ERROR: node_modules does not exist. Try running "node setup" to solve this issue. Then try again. You can find detailed instructions for this in the ReadMe.')
    console.log('')
  }

}

module.exports = {
  runPlatform,
  fatalErrorHelp
}
