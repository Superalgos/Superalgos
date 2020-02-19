const { fork } = require('child_process')

fork('./EventsServer/server.js', undefined, { stdio: 'inherit' })
fork('./WebSocketsServer/server.js', undefined, { stdio: 'inherit' })
fork('./TaskManager/server.js', undefined, { stdio: 'inherit' })
fork('./WebServer/server.js', undefined, { stdio: 'inherit' })

