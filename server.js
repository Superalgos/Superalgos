
process.on('uncaughtException', function (err) {
    if (err.message.indexOf("EADDRINUSE") > 0) {
        console.log("A Superalgos Backend Server cannot be started. Reason: the port " + port + " is already in use by another application.")
        return
    }
    console.log('[ERROR] Backend Server -> server -> uncaughtException -> err.message = ' + err.message)
    console.log('[ERROR] Backend Server -> server -> uncaughtException -> err.stack = ' + err.stack)
    process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
    console.log('[ERROR] Backend Server -> server -> unhandledRejection -> reason = ' + JSON.stringify(reason))
    console.log('[ERROR] Backend Server -> server -> unhandledRejection -> p = ' + JSON.stringify(p))
    process.exit(1)
})

/* Callbacks default responses. */

global.DEFAULT_OK_RESPONSE = {
    result: "Ok",
    message: "Operation Succeeded"
};

global.DEFAULT_FAIL_RESPONSE = {
    result: "Fail",
    message: "Operation Failed"
};

global.DEFAULT_RETRY_RESPONSE = {
    result: 'Retry',
    message: 'Retry Later'
}

global.CUSTOM_OK_RESPONSE = {
    result: 'Ok, but check Message',
    message: 'Custom Message'
}

global.CUSTOM_FAIL_RESPONSE = {
    result: 'Fail Because',
    message: 'Custom Message'
}


let EVENTS_SERVER = require('./eventsServer.js');
let WEB_SOCKETS_SERVER = require('./webSocketsServer.js');
let TASK_MANAGER_SERVER = require('./taskManagerServer.js');
let WEB_SERVER = require('./webServer.js');

try {
    EVENTS_SERVER = EVENTS_SERVER.newEventsServer()
    EVENTS_SERVER.initialize()
    EVENTS_SERVER.run()

    WEB_SOCKETS_SERVER = WEB_SOCKETS_SERVER.newWebSocketsServer(EVENTS_SERVER)
    WEB_SOCKETS_SERVER.initialize()
    WEB_SOCKETS_SERVER.run()

    TASK_MANAGER_SERVER = TASK_MANAGER_SERVER.newTaskManagerServer(WEB_SOCKETS_SERVER, EVENTS_SERVER)
    TASK_MANAGER_SERVER.initialize()
    TASK_MANAGER_SERVER.run()

    WEB_SERVER = WEB_SERVER.newWebServer(EVENTS_SERVER)
    WEB_SERVER.initialize()
    WEB_SERVER.run()

    console.log("You are running Superalgos Beta 7: What's new? Multi-Project & Machine Learning Infrastructure is being implemented here.")

} catch (err) {
    console.log('[ERROR] BackendServers -> Task Manager -> server -> Error = ' + err.stack)
}

