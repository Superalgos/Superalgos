
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
    console.log('VERSION:          Beta 7')
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
    console.log('                  noBrowser:   Optional. Use it to launch Superalgos Backend only. The UI will not be loaded.')
    console.log('                  minMemo:     Optional. Use it when your hardware has less than 8 Gb or memory.')

    return
}

console.log('')
console.log('OPTIONS ACCEPTED:')
console.log('')
let optionsAccepted = 0

let options = {
    execArgv: ['--max-old-space-size=8192'],
    stdio: 'inherit'
}

if (process.argv.includes("minMemo")) {
    options = {
        stdio: 'inherit'
    }
    optionsAccepted++
    console.log('minMemo ............................ Running with Minimun Required Memory.')
}

if (process.argv.includes("noBrowser")) {
    optionsAccepted++
    console.log('noBrowser .......................... Running without User Interface.')
}

if (optionsAccepted === 0) {
    console.log('none ............................... Running without any command line options.')
}

console.log('')

const { fork } = require('child_process')
fork('./Client/client.js', process.argv, options)
