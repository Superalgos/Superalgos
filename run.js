
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
    console.log('VERSION:          Beta 9')
    console.log('')
    console.log('WEB:              https://www.superalgos.org')
    console.log('')
    console.log('GITHUB:           https://www.github.com/Superalgos')
    console.log('')
    console.log('DOCUMENTATION:    https://docs.superalgos.org/')
    console.log('')
    console.log('TELEGRAM SUPPORT: https://t.me/superalgoscommunity')
    console.log('')
    console.log('USAGE:            node run [help] [noBrowser] [minMemo]')
    console.log('')
    console.log('OPTIONS:')
    console.log('')
    console.log('                  help:        Optional. Use it to see this helping information.')
    console.log('                  noBrowser:   Optional. Use it to launch Superalgos Client only. The UI will not be loaded.')
    console.log('                  minMemo:     Optional. Use it when your hardware has less than 8 Gb or memory.')
    console.log('')
    console.log('If you are having an error while trying to run this Client, consider this:')

    fatalErrorHelp()
    return
}

const OS = require("os")
let totalRAM = OS.totalmem() // Get total ram installed
totalRAM = totalRAM / 1024 / 1024
let optimalRAM = totalRAM * 0.85 // Use 85% of installed RAM
let maxOldSpaceSize = "--max-old-space-size=" + (optimalRAM.toFixed(0)).toString()
let options

console.log('')
console.log("Total RAM istalled in this system is ........................ " + (totalRAM / 1024).toFixed(2) + " GB")
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
    console.log('minMemo ..................................................... Running with Minimun Required Memory.')
} 

if (process.argv.includes("noBrowser")) {
    optionsAccepted++
    console.log('noBrowser ................................................... Running without User Interface.')
}

if (optionsAccepted === 0) {
    console.log('none ........................................................ Running without any command line options.')
}
console.log('')
console.log('')

try {
    const { fork } = require('child_process')
    fork('./Client/client.js', process.argv, options)
} catch (err) {
    console.log('')
    console.log('Fail to create Client Process.')
    console.log('')

    fatalErrorHelp()
}

function fatalErrorHelp() {
    console.log('')
    console.log('* If your device does not have MORE than 8GB of RAM then please use the minMemo option.')
    console.log('* If your OS does not have a user interface, please use the noBrowser option.')
    console.log('')
    console.log('If you continue having trouble to start the Client try:')
    console.log('')
    console.log('node run minMemo noBrowser')
}
