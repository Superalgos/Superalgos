exports.newPlatformApp = function newPlatformApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run(initialWorkspace) {

        process.on('uncaughtException', function (err) {
            if (err.message && err.message.indexOf("EADDRINUSE") > 0) {
                console.log("The Superalgos Platform Client cannot be started. Reason: the port configured migth be being used by another application, or Superalgos Platform Client might be already running.")
                return
            }
            console.log('[ERROR] Platform App -> uncaughtException -> err.message = ' + err.message)
            console.log('[ERROR] Platform App -> uncaughtException -> err.stack = ' + err.stack)
            console.log('[ERROR] Platform App -> uncaughtException -> err = ' + err)
            process.exit(1)
        })

        process.on('unhandledRejection', (reason, p) => {
            // Signal user that a necessary node module is missing
            if (reason.code == 'MODULE_NOT_FOUND') {
                console.log("[ERROR] Dependency library not found. Please try running the 'node setup' command and then restart the Superalgos Platform Client.")
                console.log('[ERROR] Platform App -> reason = ' + JSON.stringify(reason))
                process.exit(1)
            }
            console.log('[ERROR] Platform App -> unhandledRejection -> reason = ' + JSON.stringify(reason))
            console.log('[ERROR] Platform App -> unhandledRejection -> p = ' + JSON.stringify(p))
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
            let WEB_SERVER = require('./Client/webServer.js')
            let DATA_FILE_SERVER = require('./Client/dataFileServer.js')
            let PROJECT_FILE_SERVER = require('./Client/projectFileServer.js')
            let UI_FILE_SERVER = require('./Client/uiFileServer.js')
            let PLUGIN_SERVER = require('./Client/pluginServer.js')
            let EVENT_SERVER = require('./Client/eventServer.js')
            let TASK_MANAGER_SERVER = require('./Client/taskManagerServer.js')
            let CCXT_SERVER = require('./Client/ccxtServer.js')
            let WEB3_SERVER = require('./Client/web3Server.js')
            let GITHUB_SERVER = require('./Client/githubServer.js')

            /* Network Interfaces */
            let WEB_SOCKETS_INTERFACE = require('./Client/webSocketsInterface.js')
            let HTTP_INTERFACE = require('./Client/httpInterface.js')
            /*
            Setting up servers running inside this Client.
            */
            PL.servers = {}
            console.log('SUPERALGOS PLATFORM CLIENT SERVERS:')
            console.log('')

            PL.servers.WEB_SERVER = WEB_SERVER.newWebServer()
            PL.servers.WEB_SERVER.initialize()
            PL.servers.WEB_SERVER.run()
            console.log('Web Server .................................................. Started')

            PL.servers.UI_FILE_SERVER = UI_FILE_SERVER.newUIFileServer()
            PL.servers.UI_FILE_SERVER.initialize()
            PL.servers.UI_FILE_SERVER.run()
            console.log('UI File Server .............................................. Started')

            PL.servers.PROJECT_FILE_SERVER = PROJECT_FILE_SERVER.newProjectFileServer()
            PL.servers.PROJECT_FILE_SERVER.initialize()
            PL.servers.PROJECT_FILE_SERVER.run()
            console.log('Project File Server ......................................... Started')

            PL.servers.PLUGIN_SERVER = PLUGIN_SERVER.newPluginServer()
            PL.servers.PLUGIN_SERVER.initialize()
            PL.servers.PLUGIN_SERVER.run()
            console.log('Plugin Server ............................................... Started')

            PL.servers.DATA_FILE_SERVER = DATA_FILE_SERVER.newDataFileServer()
            PL.servers.DATA_FILE_SERVER.initialize()
            PL.servers.DATA_FILE_SERVER.run()
            console.log('Data File Server ............................................ Started')

            PL.servers.EVENT_SERVER = EVENT_SERVER.newEventServer()
            PL.servers.EVENT_SERVER.initialize()
            PL.servers.EVENT_SERVER.run()
            console.log('Events Server ............................................... Started')

            TASK_MANAGER_SERVER = TASK_MANAGER_SERVER.newTaskManagerServer()
            TASK_MANAGER_SERVER.initialize()
            TASK_MANAGER_SERVER.run()
            console.log('Task Manager Server ......................................... Started')

            PL.servers.CCXT_SERVER = CCXT_SERVER.newCCXTServer()
            PL.servers.CCXT_SERVER.initialize()
            PL.servers.CCXT_SERVER.run()
            console.log('CCXT Server ................................................. Started')

            PL.servers.WEB3_SERVER = WEB3_SERVER.newWeb3Server()
            PL.servers.WEB3_SERVER.initialize()
            PL.servers.WEB3_SERVER.run()
            console.log('WEB3 Server ................................................. Started')

            PL.servers.GITHUB_SERVER = GITHUB_SERVER.newGithubServer()
            PL.servers.GITHUB_SERVER.initialize()
            PL.servers.GITHUB_SERVER.run()
            console.log('Github Server ............................................... Started')

            console.log('')
            console.log('SUPERALGOS PLATFORM CLIENT INTERFACES:')
            console.log('')
            WEB_SOCKETS_INTERFACE = WEB_SOCKETS_INTERFACE.newWebSocketsInterface()
            WEB_SOCKETS_INTERFACE.initialize()
            console.log('Web Sockets Interface ....................................... Listening at port ' + global.env.PLATFORM_WEB_SOCKETS_INTERFACE_PORT)

            HTTP_INTERFACE = HTTP_INTERFACE.newHttpInterface()
            HTTP_INTERFACE.initialize(initialWorkspace)
            console.log('Http Interface .............................................. Listening at port ' + global.env.PLATFORM_HTTP_INTERFACE_PORT)

            console.log('')
            console.log("You are running Superalgos Platform " + SA.version)
            console.log('')
            console.log("What's new? These are the main new features in this version:")
            console.log('')
            console.log('Governance System ........................................... Automates the distribution of SA Tokens and allow users to vote on the direction of the project.')
            console.log('TensorFlow Integration ...................................... Allows creating and training ML models and use them in trading strategies.')
            console.log('')
            console.log("What's next? This is the current development pipeline:")
            console.log('')
            console.log('Superalgos P2P Network ...................................... Will allow algo-traders to share trading signals with Superalgos users consuming these signals via a mobile app.')
            console.log('Real-time Trading Signals ................................... Will allow users to emit trading signals and be rewarded with SA Tokens.')
            console.log('Superalgos Mobile ........................................... Will allow users to consume trading signals for free and autonomously execute trades from their mobile phones.')
            console.log('Portfolio Manager ........................................... Will allow a Portfolio Manager bot to supervize Trading Bots deciding where and when to increase or decrease their position sizes.]')

            console.log('')

        } catch (err) {
            console.log('[ERROR] Platform App -> Error = ' + err.stack)
        }
    }
}