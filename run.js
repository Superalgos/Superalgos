
let options = {
    execArgv: ['--max-old-space-size=8192'],
    stdio: 'inherit'
}

const { fork } = require('child_process')
fork('./BackendServers/server.js', process.argv, options)
