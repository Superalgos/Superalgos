const { fork } = require('child_process')

fork('./BackendServers/server.js', undefined, { stdio: 'inherit' })
fork('./WebServer/server.js', undefined, { stdio: 'inherit' })

