exports.newSocialTradingApp = function newSocialTradingApp() {

    let thisObject = {
        webSocketsInterface: undefined,
        httpInterface: undefined,
        expressHttpInterface: undefined,
        webAppInterface: undefined,
        p2pNetworkInterface: undefined,
        p2pNetworkClient: undefined,
        run: run
    }

    ST.socialTradingApp = thisObject

    return thisObject

    async function run() {

        /*
        SOCIALTRADING_APP_UPDATE_PROFILES: Pull latest profiles from Github repo
        */
        let SOCIALTRADING_APP_UPDATE_PROFILES = true
        let SOCIALTRADING_BOT_REFERENCE       /* Referenced Social Trading Bots connected to Task Servers, remains undefined here */
        /* 
        Social Trading App Interfaces:
        
        WEB_SOCKETS_INTERFACE_MODULE:   This is the interface where we expect to receive requests from the UI and send the responses to those requests back to the UI
                                        syncroniously. This is a local network transport level communication Interface.

        HTTP_INTERFACE_MODULE:          We will use this interface to receive from the UI request for JS files or maybe data files if they are eventually needed.
                                        This is a local network transport level communication Interface.
        
        WEB_APP_INTERFACE_MODULE:       The Social-Trading App has 2 main parts: 1) The Client (a nodejs process), and 2) a Web App (a browser ran app).
                                        The Web App Interface represents the Interface towards the Web App inside the App Client regardless of the transport used to 
                                        get the request from the Web App to the Client. It is one layer above the Web or Http interfaces and any business request comming
                                        from the UI goes through this module.
                                        
        P2P_NETWORK_INTERFACE_MODULE:   This is the Interface where all incomming request / events / notifications from the P2P Network are going through. From there they are 
                                        routed to wherever is needed.                                        
        
        */
        let WEB_SOCKETS_INTERFACE_MODULE = require('./Client/webSocketsInterface.js')
        let HTTP_INTERFACE_MODULE = require('./Client/cleanHttpInterface.js')
        let EXPRESS_HTTP_INTERFACE_MODULE = require('./Client/expressHttpInterface/expressServer.js')
        let WEB_APP_INTERFACE_MODULE = require('./Client/webAppInterface.js')
        let P2P_NETWORK_INTERFACE_MODULE = require('./Client/p2pNetworkInterface.js')

        await initialSetupInterfaces()
        await setupNetwork()
        await finalSetupInterfaces()

        
        // //Test Message: Sometimes devs needs to quicly test something without using the UI...
        
        // let profileMessage = {
        //     profileType: SA.projects.socialTrading.globals.profileTypes.CREATE_SOCIAL_ENTITY,
        //     socialEntityHandle: 'Pepe',
        //     socialEntityType: 'Social Persona',
        //     userAppType: 'Social Trading Desktop App'
        // }

        // let testMessage = {
        //     networkService: 'Social Graph',
        //     requestType: 'Profile',
        //     profileMessage: JSON.stringify(profileMessage)
        // }
        
        // let response = await thisObject.webAppInterface.sendMessage(JSON.stringify(testMessage))
        // console.log(response)
        

        async function initialSetupInterfaces() {
            /*
            This is what we are going to use to process requests from the Web App / UI.
            */
            thisObject.webAppInterface = WEB_APP_INTERFACE_MODULE.newWebAppInterface()
            thisObject.webAppInterface.initialize()
            /*
            This is what we are going to use to receive events from the P2P Network.
            */
            thisObject.p2pNetworkInterface = P2P_NETWORK_INTERFACE_MODULE.newP2PNetworkInterface()
            thisObject.p2pNetworkInterface.initialize()
        }

        async function setupNetwork() {
            /*
            We set up the P2P Network Client.
            */
            thisObject.p2pNetworkClient = SA.projects.network.modules.p2pNetworkClient.newNetworkModulesP2PNetworkClient()
            /*
            Emulate the P2PClientNode that when we are at the Platform UI is defined by Users at the Task Level. In this 
            case the user does not need to set it up, so we do it here, with the right settings for the Social Trading App.
            */
            let P2P_NETWORK_CLIENT_DEFINITION = require('./Client/P2PNetworkClient.json')

            await thisObject.p2pNetworkClient.initialize(
                global.env.SOCIALTRADING_APP_SIGNING_ACCOUNT,
                global.env.SOCIALTRADING_TARGET_NETWORK_TYPE,
                global.env.SOCIALTRADING_TARGET_NETWORK_CODENAME,
                global.env.SOCIALTRADING_APP_MAX_OUTGOING_PEERS,
                global.env.SOCIALTRADING_APP_MAX_OUTGOING_START_PEERS,
                thisObject.p2pNetworkInterface.eventReceived,
                P2P_NETWORK_CLIENT_DEFINITION,
                SOCIALTRADING_APP_UPDATE_PROFILES,
                SOCIALTRADING_BOT_REFERENCE
            )
        }

        async function finalSetupInterfaces() {
            
            if (global.env.SOCIALTRADING_APP_UI_TYPE === 'vueDev') {
                /* 
                These are the Network Interfaces by which the Web App interacts with this Social Trading App Client.
                If UI chosen is Vue Dev server, launch the development Server 
                */
                let port = '8000'
                const PATH_TO_UI_ROOT = SA.nodeModules.path.join(process.cwd(), global.env.PATH_TO_SOCIALTRADING, 'Vue-UI')
                const PATH_TO_VITE = SA.nodeModules.path.join(process.cwd(), global.env.PATH_TO_SOCIALTRADING, 'Vue-UI/node_modules/.bin/vite')
                console.log('this is our current working directory', PATH_TO_UI_ROOT)
                const command = `${PATH_TO_VITE} --port ${port}` 
                const nodeInstPromise = new Promise(() => {
                  const child = SA.nodeModules.childProcess.exec(command, 
                    {cwd: PATH_TO_UI_ROOT}, 
                    (error, stdout) => {
                      if (error) {
                        console.log('')
                        console.log('There was an error starting the Vue UI development server: ')
                        console.log('')
                        console.log(error)
                        process.exit(1)
                      }
                      console.log('')
                      console.log(stdout)
                    })
                  try {
                    child.stdout.pipe(process.stdout)
                    child.on('exit', async () => {
                      console.log('')
                      console.log('Closing Vue Development Server....')
                      await nodeInstPromise
                    })
                  } catch (e) {
                    console.log('')
                    console.log('Event error: ')
                    console.log('')
                    console.log(e)
                    process.exit(1)
                }})
               
                // Then launch the backend server
                thisObject.expressHttpInterface = EXPRESS_HTTP_INTERFACE_MODULE.SocialTradingBackend(ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort, SA, ST);
                console.log(`express Interface ................................................ Listening at port ${ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort}`);

                /* if (global.env.SOCIALTRADING_APP_UI_TYPE === 'vue') {
                    //Set up static file server for UI files
                    const PATH_TO_UI_FILES = SA.nodeModules.path.resolve(__dirname, '../Vue-UI/dist')
                    let fileServer = new SA.nodeModules.static.Server(PATH_TO_UI_FILES)
        
                    //Now Serve all needed UI files 
                    httpRequest.addListener('end', function (){
                        fileServer.serve(httpRequest, httpResponse)
                    }).resume()
        
                } else if (global.env.SOCIALTRADING_APP_UI_TYPE === 'vueDev') {
                    let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
                    let requestPath = requestPathAndParameters[0].split('/')
                    let endpointOrFile = requestPath[1]
        
                   
                
                // TODO: move clean UI to use this httpinterface
                } */
            } else if (global.env.SOCIALTRADING_APP_UI_TYPE === 'vue') {
                /* 
                These are the Network Interfaces by which the Web App interacts with this Social Trading App Client.
                */
                thisObject.expressHttpInterface = EXPRESS_HTTP_INTERFACE_MODULE.SocialTradingBackend(ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort, SA, ST);
                console.log(`express Interface ................................................ Listening at port ${ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort}`);
            } else {
                /* 
                These are the Network Interfaces by which the Web App interacts with this Social Trading App Client.
                If now UI is specifed launch the clean UI
                */
                thisObject.webSocketsInterface = WEB_SOCKETS_INTERFACE_MODULE.newWebSocketsInterface()
                thisObject.webSocketsInterface.initialize()
                console.log('Social Trading App Client Web Sockets Interface ............................... Listening at port ' + ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webSocketsPort)
            
                thisObject.httpInterface = HTTP_INTERFACE_MODULE.newHttpInterface()
                thisObject.httpInterface.initialize()
                console.log('Social Trading App Client Http Interface ...................................... Listening at port ' + ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort)
            }
        }
    }
}
