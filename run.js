const { fork } = require('child_process')
fork('./BackendServers/server.js', undefined, { stdio: 'inherit' })


