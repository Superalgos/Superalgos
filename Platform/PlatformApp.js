exports.newPlatformApp = function newPlatformApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run(initialWorkspace) {

        process.on('uncaughtException', function (err) {
            if (err.message && err.message.indexOf("EADDRINUSE") > 0) {
                SA.logger.info("The Superalgos Platform Client cannot be started. Reason: the port configured might be being used by another application, or Superalgos Platform Client might be already running.")
                return
            }
            SA.logger.error('Platform App -> uncaughtException -> err.message = ' + err.message)
            SA.logger.error('Platform App -> uncaughtException -> err.stack = ' + err.stack)
            SA.logger.error('Platform App -> uncaughtException -> err = ' + err)
            process.exit(1)
        })

        process.on('unhandledRejection', (reason, p) => {
            // Signal user that a necessary node module is missing
            if (reason.code == 'MODULE_NOT_FOUND') {
                SA.logger.error("Dependency library not found. Please try running the 'node setup' command and then restart the Superalgos Platform Client.")
                SA.logger.error('Platform App -> reason = ' + JSON.stringify(reason))
                process.exit(1)
            }
            SA.logger.error('Platform App -> unhandledRejection -> reason = ' + JSON.stringify(reason))
            SA.logger.error('Platform App -> unhandledRejection -> p = ' + JSON.stringify(p))
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
            let BITCOIN_FACTORY_SERVER = require('./Client/bitcoinFactoryServer.js')

            /* Network Interfaces */
            let WEB_SOCKETS_INTERFACE = require('./Client/webSocketsInterface.js')
            let HTTP_INTERFACE = require('./Client/httpInterface.js')
            let DASHBOARDS_WEB_SOCKET_INTERFACE = require('./Client/dashboardsInterface.js')

            let RESTART_SERVER = require('./Client/restartServer')

            /*
            Setting up servers running inside this Client.
            */
            PL.servers = {}
            SA.logger.info('SUPERALGOS PLATFORM CLIENT SERVERS:')
            SA.logger.info('')

            PL.servers.RESTART_SERVER = RESTART_SERVER.restartServer()

            PL.servers.WEB_SERVER = WEB_SERVER.newWebServer()
            PL.servers.WEB_SERVER.initialize()
            PL.servers.WEB_SERVER.run()
            SA.logger.info('Web Server .................................................. Started')

            PL.servers.UI_FILE_SERVER = UI_FILE_SERVER.newUIFileServer()
            PL.servers.UI_FILE_SERVER.initialize()
            PL.servers.UI_FILE_SERVER.run()
            SA.logger.info('UI File Server .............................................. Started')

            PL.servers.PROJECT_FILE_SERVER = PROJECT_FILE_SERVER.newProjectFileServer()
            PL.servers.PROJECT_FILE_SERVER.initialize()
            PL.servers.PROJECT_FILE_SERVER.run()
            SA.logger.info('Project File Server ......................................... Started')

            PL.servers.PLUGIN_SERVER = PLUGIN_SERVER.newPluginServer()
            PL.servers.PLUGIN_SERVER.initialize()
            PL.servers.PLUGIN_SERVER.run()
            SA.logger.info('Plugin Server ............................................... Started')

            PL.servers.DATA_FILE_SERVER = DATA_FILE_SERVER.newDataFileServer()
            PL.servers.DATA_FILE_SERVER.initialize()
            PL.servers.DATA_FILE_SERVER.run()
            SA.logger.info('Data File Server ............................................ Started')

            PL.servers.EVENT_SERVER = EVENT_SERVER.newEventServer()
            PL.servers.EVENT_SERVER.initialize()
            PL.servers.EVENT_SERVER.run()
            SA.logger.info('Events Server ............................................... Started')

            PL.servers.TASK_MANAGER_SERVER = TASK_MANAGER_SERVER.newTaskManagerServer()
            PL.servers.TASK_MANAGER_SERVER.initialize()
            PL.servers.TASK_MANAGER_SERVER.run()
            SA.logger.info('Task Manager Server ......................................... Started')

            PL.servers.CCXT_SERVER = CCXT_SERVER.newCCXTServer()
            PL.servers.CCXT_SERVER.initialize()
            PL.servers.CCXT_SERVER.run()
            SA.logger.info('CCXT Server ................................................. Started')

            PL.servers.WEB3_SERVER = WEB3_SERVER.newWeb3Server()
            PL.servers.WEB3_SERVER.initialize()
            PL.servers.WEB3_SERVER.run()
            SA.logger.info('WEB3 Server ................................................. Started')

            PL.servers.GITHUB_SERVER = GITHUB_SERVER.newGithubServer()
            PL.servers.GITHUB_SERVER.initialize()
            PL.servers.GITHUB_SERVER.run()
            SA.logger.info('Github Server ............................................... Started')

            PL.servers.BITCOIN_FACTORY_SERVER = BITCOIN_FACTORY_SERVER.newBitcoinFactoryServer()
            PL.servers.BITCOIN_FACTORY_SERVER.initialize()
            PL.servers.BITCOIN_FACTORY_SERVER.run()
            SA.logger.info('Bitcoin Factory Server ...................................... Started')

            SA.logger.info('')
            SA.logger.info('SUPERALGOS PLATFORM CLIENT INTERFACES:')
            SA.logger.info('')
            WEB_SOCKETS_INTERFACE = WEB_SOCKETS_INTERFACE.newWebSocketsInterface()
            WEB_SOCKETS_INTERFACE.initialize()
            SA.logger.info('Web Sockets Interface ....................................... Listening at port ' + global.env.PLATFORM_WEB_SOCKETS_INTERFACE_PORT)

            HTTP_INTERFACE = HTTP_INTERFACE.newHttpInterface()
            HTTP_INTERFACE.initialize(initialWorkspace)
            SA.logger.info('Http Interface .............................................. Listening at port ' + global.env.PLATFORM_HTTP_INTERFACE_PORT)

            DASHBOARDS_WEB_SOCKET_INTERFACE = DASHBOARDS_WEB_SOCKET_INTERFACE.newDashboardsInterface()
            DASHBOARDS_WEB_SOCKET_INTERFACE.initialize()
            DASHBOARDS_WEB_SOCKET_INTERFACE.run()
            SA.logger.info('Dashboard App Interface ..................................... Initializing on port ' + global.env.DASHBOARDS_WEB_SOCKETS_INTERFACE_PORT)

            SA.logger.info('Initial Workspace............................................ ' + initialWorkspace.project + ' ' + initialWorkspace.name)



            SA.logger.info('')
            SA.logger.info("You are running Superalgos Platform " + SA.version)
            SA.logger.info('')
            SA.logger.info("What's new? These are the main new features in this version:")
            SA.logger.info('')
            SA.logger.info('Superalgos P2P Network ...................................... Allows interconnecting clients so that users may collaborate.')
            SA.logger.info('Real-time Trading Signals ................................... Enables the broadcasting and consumption of trading signals.')
            SA.logger.info('Portfolio Manager ........................................... Portfolio Manager bots supervise and manage Trading Bots for improved capital allocation and risk management.')
            SA.logger.info('')
            SA.logger.info("What's next? This is the current development pipeline:")
            SA.logger.info('')
            SA.logger.info('Superalgos Mobile ........................................... Will allow users to consume trading signals from their mobile phones.')
            SA.logger.info('')
            SA.logger.info('Join the @superalgosdevelop Telegram Group to learn more!')
            SA.logger.info('')
            
            SA.logger.debug('This is a debug line and you should only see this as a developer, because they have x-ray vision...')
            SA.logger.debug('')

        } catch (err) {
            SA.logger.error('Platform App -> Error = ' + err.stack)
        }
    }
}
