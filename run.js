const { fork } = require('child_process')
fork('./BackendServers/server.js', process.argv, { stdio: 'inherit' })


