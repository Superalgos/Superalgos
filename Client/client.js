
/* Load Environment Variables */
let ENVIRONMENT = require('../Environment.js');
let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
global.env = ENVIRONMENT_MODULE

process.on('uncaughtException', function (err) {
    if (err.message.indexOf("EADDRINUSE") > 0) {
        console.log("A Superalgos Client cannot be started. Reason: the port " + port + " is already in use by another application.")
        return
    }
    console.log('[ERROR] Client -> client-> uncaughtException -> err.message = ' + err.message)
    console.log('[ERROR] Client -> client-> uncaughtException -> err.stack = ' + err.stack)
    process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
    console.log('[ERROR] Client -> client-> unhandledRejection -> reason = ' + JSON.stringify(reason))
    console.log('[ERROR] Client -> client-> unhandledRejection -> p = ' + JSON.stringify(p))
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

/* Servers */
let WEB_SERVER = require('./webServer.js')
let DATA_FILE_SERVER = require('./dataFileServer.js')
let PROJECT_FILE_SERVER = require('./projectFileServer.js')
let UI_FILE_SERVER = require('./uiFileServer.js')
let PLUGIN_SERVER = require('./pluginServer.js')
let EVENT_SERVER = require('./eventServer.js')
let TASK_MANAGER_SERVER = require('./taskManagerServer.js')
let CCXT_SERVER = require('./ccxtServer.js')
let WEB3_SERVER = require('./web3Server.js')

/* Network Interfaces */
let WEB_SOCKETS_INTERFACE = require('./webSocketsServer.js')
let HTTP_INTERFACE = require('./httpInterface.js')

try {
    console.log('CLIENT SERVERS:')
    console.log('')

    WEB_SERVER = WEB_SERVER.newWebServer()
    WEB_SERVER.initialize()
    WEB_SERVER.run()
    console.log('Web Server ......................... Started')

    UI_FILE_SERVER = UI_FILE_SERVER.newUIFileServer()
    UI_FILE_SERVER.initialize()
    UI_FILE_SERVER.run()
    console.log('UI File Server ..................... Started')

    PROJECT_FILE_SERVER = PROJECT_FILE_SERVER.newProjectFileServer()
    PROJECT_FILE_SERVER.initialize()
    PROJECT_FILE_SERVER.run()
    console.log('Project File Server ................ Started')
    
    PLUGIN_SERVER = PLUGIN_SERVER.newPluginServer()
    PLUGIN_SERVER.initialize()
    PLUGIN_SERVER.run()
    console.log('Plugin Server ...................... Started')

    DATA_FILE_SERVER = DATA_FILE_SERVER.newDataFileServer()
    DATA_FILE_SERVER.initialize()
    DATA_FILE_SERVER.run()
    console.log('Data File Server ................... Started')

    EVENT_SERVER = EVENT_SERVER.newEventServer()
    EVENT_SERVER.initialize()
    EVENT_SERVER.run()
    console.log('Events Server ...................... Started')

    TASK_MANAGER_SERVER = TASK_MANAGER_SERVER.newTaskManagerServer(WEB_SOCKETS_INTERFACE, EVENT_SERVER)
    TASK_MANAGER_SERVER.initialize()
    TASK_MANAGER_SERVER.run()
    console.log('Task Manager Server ................ Started')

    CCXT_SERVER = CCXT_SERVER.newCCXTServer()
    CCXT_SERVER.initialize()
    CCXT_SERVER.run()
    console.log('CCXT Server ........................ Started')
    
    WEB3_SERVER = WEB3_SERVER.newWeb3Server()
    WEB3_SERVER.initialize()
    WEB3_SERVER.run()
    console.log('WEB3 Server ........................ Started')

    console.log('')
    console.log('CLIENT INTERFACES:')
    console.log('')

    WEB_SOCKETS_INTERFACE = WEB_SOCKETS_INTERFACE.newWebSocketsInterface(EVENT_SERVER)
    WEB_SOCKETS_INTERFACE.initialize()
    WEB_SOCKETS_INTERFACE.run()
    console.log('Web Sockets Interface .............. Listening at port ' + global.env.WEB_SOCKETS_INTERFACE_PORT)

    HTTP_INTERFACE = HTTP_INTERFACE.newHttpInterface(WEB_SERVER, DATA_FILE_SERVER, PROJECT_FILE_SERVER, UI_FILE_SERVER, PLUGIN_SERVER, CCXT_SERVER, WEB3_SERVER)
    HTTP_INTERFACE.initialize()
    HTTP_INTERFACE.run()
    console.log('Http Interface ..................... Listening at port ' + global.env.HTTP_INTERFACE_PORT)

    console.log('')
    console.log("You are running Superalgos Beta 7 SP 1")
    console.log('')
    console.log("What's new? The following was implemented here:")
    console.log('')
    console.log('Multi-Project Infrastructure ....... This allow us to integrate crypto projects into Superalgos. Note that with this upgrade you will need to download and calculate market data again.')
    console.log('')
    console.log("What's next? At the development pipeline we have:")
    console.log('')
    console.log('Ethereum Integration ............... This will allow mining data from an Ethereum network node, create indicators with it, an use it on strategies.')
    console.log('Machine Learning Infrastructure .... This will enable a new kind of Bot that can learn from data mined. Later that knowledge can be used at trading strategies.')
    console.log('')

} catch (err) {
    console.log('[ERROR] Client -> Error = ' + err.stack)
}

