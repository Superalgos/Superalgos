let options = {
    execArgv: ['--max-old-space-size=8192'],
    stdio: 'inherit'
}

if (process.argv.includes("minMemo")) {
    options = {
        stdio: 'inherit'
    }
    console.log('Running with Minimun Memory Required.')
}

const { fork } = require('child_process')
fork('./BackendServers/server.js', process.argv, options)
