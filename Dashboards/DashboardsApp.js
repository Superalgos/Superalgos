exports.newDashboardsApp = function newDashboardsApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run(mode) {
        
        process.on('uncaughtException', function (err) {
            if (err.message && err.message.indexOf("EADDRINUSE") > 0) {
                console.log("The Superalgos Dashboards Client cannot be started. Reason: the port configured migth be being used by another application, or Superalgos Dashboards Client might be already running.")
                return
            }
            console.log((new Date()).toISOString(), '[ERROR] Dashboards App -> uncaughtException -> err.message = ' + err.message)
            console.log((new Date()).toISOString(), '[ERROR] Dashboards App -> uncaughtException -> err.stack = ' + err.stack)
            console.log((new Date()).toISOString(), '[ERROR] Dashboards App -> uncaughtException -> err = ' + err)
            process.exit(1)
        })

        process.on('unhandledRejection', (reason, p) => {
            // Signal user that a necessary node module is missing
            if (reason.code == 'MODULE_NOT_FOUND') {
                console.log("[ERROR] Dependency library not found. Please try running the 'node setup' command and then restart the Superalgos Dashboards Client.")
                console.log((new Date()).toISOString(), '[ERROR] Dashboards App -> reason = ' + JSON.stringify(reason))
                process.exit(1)
            }
            console.log((new Date()).toISOString(), '[ERROR] Dashboards App -> unhandledRejection -> reason = ' + JSON.stringify(reason))
            console.log((new Date()).toISOString(), '[ERROR] Dashboards App -> unhandledRejection -> p = ' + JSON.stringify(p))
            process.exit(1)
        })
        try {
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
            let UI_SERVER = require('./UI/UiLoader.js')
            let WEBSOCKET_SERVER = require('./Client/websocketServer.js')

            /* Network Interfaces */

            /*
            Setting up servers running inside this Client.
            */
            DS.servers = {}
            console.log('SUPERALGOS DASHBOARDS CLIENT SERVERS:')
            console.log('')

            if (mode === "devBackend") {
                DS.servers.WEBSOCKET_SERVER = WEBSOCKET_SERVER.newWebSocketsServer()
                DS.servers.WEBSOCKET_SERVER.initialize()
                console.log('Websocket Server .................................................. Started in Dev Mode')
                
            } else if (mode === "devFrontend") {
                DS.servers.UI_SERVER = UI_SERVER.newDashboardsUIApp()
                DS.servers.UI_SERVER.initialize()
                console.log('UI Server .................................................. Started in Dev Mode')
            
            } else {
                // Start both front and backend if no dev mode declared
                DS.servers.WEBSOCKET_SERVER = WEBSOCKET_SERVER.newWebSocketsServer()
                DS.servers.WEBSOCKET_SERVER.initialize()
                console.log('Websocket Server .................................................. Started')

                DS.servers.UI_SERVER = UI_SERVER.newDashboardsUIApp()
                DS.servers.UI_SERVER.initialize()
                console.log('UI Server .................................................. Started')
            }

            console.log('')
            console.log("You are running Superalgos Dashboards App: " + SA.version)
            console.log('')
            console.log('Join the @superalgosdevelop Telegram Group to learn more!')

            console.log('')

        } catch (err) {
            console.log((new Date()).toISOString(), '[ERROR] Dashboards App -> Error = ' + err.stack)
        }
    }
}
