exports.newDesktopApp = function newDesktopApp() {

    let thisObject = {
        appBootstrapingProcess: undefined,
        p2pNetworkClientIdentity: undefined,
        p2pNetwork: undefined,
        p2pNetworkPeers: undefined,
        webSocketsInterface: undefined,
        httpInterface: undefined,
        webAppInterface: undefined,
        p2pNetworkInterface: undefined,
        socialGraph: undefined,
        run: run
    }

    DK.desktopApp = thisObject

    return thisObject

    async function run() {

        /* Desktop App Interfaces */
        let WEB_SOCKETS_INTERFACE_MODULE = require('./Client/webSocketsInterface.js')
        let HTTP_INTERFACE_MODULE = require('./Client/httpInterface.js')
        let WEB_APP_INTERFACE_MODULE = require('./Client/webAppInterface.js')

        await setupNetwork()
        await setupServices()

        async function setupNetwork() {
            /*
            We set up ourselves as a Network Client.
            */
            thisObject.p2pNetworkClientIdentity = SA.projects.network.modules.p2pNetworkClientIdentity.newNetworkModulesP2PNetworkClientIdentity()
            /*
            We will read all user profiles plugins and get from there our network identity.
            */
            thisObject.appBootstrapingProcess = SA.projects.network.modules.appBootstrapingProcess.newNetworkModulesAppBootstrapingProcess()
            await thisObject.appBootstrapingProcess.run(global.env.DESKTOP_APP_SIGNING_ACCOUNT, thisObject.p2pNetworkClientIdentity)
            /*
            We set up the P2P Network.
            */
            thisObject.p2pNetwork = SA.projects.network.modules.p2pNetwork.newNetworkModulesP2PNetwork()
            await thisObject.p2pNetwork.initialize(
                'Network Client',
                global.env.DESKTOP_TARGET_NETWORK_CODENAME,
                global.env.DESKTOP_TARGET_NETWORK_TYPE,
                thisObject.p2pNetworkClientIdentity
            )
            /*
            This is where we will process all the events comming from the p2p network.
            */
            thisObject.p2pNetworkInterface = SA.projects.socialTrading.modules.p2pNetworkInterface.newSocialTradingModulesP2PNetworkInterface()
            /*
            Set up the connections to network nodes.
            */
            thisObject.p2pNetworkPeers = SA.projects.network.modules.p2pNetworkPeers.newNetworkModulesP2PNetworkPeers()
            await thisObject.p2pNetworkPeers.initialize(
                'Network Client',
                thisObject.p2pNetworkClientIdentity,
                thisObject.p2pNetwork,
                thisObject.p2pNetworkInterface,
                global.env.DESKTOP_APP_MAX_OUTGOING_PEERS
            )
        }

        async function setupServices() {
            /*
            This is the Personal Social Graph for the user running this App.
            */
            thisObject.socialGraph = DK.projects.socialTrading.modules.socialGraph.newSocialTradingModulesSocialGraph()
            await thisObject.socialGraph.initialize()
            /*
            This is where we will process all the messages comming from our web app.
            */
            thisObject.webAppInterface = WEB_APP_INTERFACE_MODULE.newWebAppInterface()
            thisObject.webAppInterface.initialize()
            /* 
            These are the Network Interfaces by which the Web App interacts with this Desktop Client.
            */
            thisObject.webSocketsInterface = WEB_SOCKETS_INTERFACE_MODULE.newWebSocketsInterface()
            thisObject.webSocketsInterface.initialize()
            console.log('Desktop Client Web Sockets Interface ......................................... Listening at port ' + DK.desktopApp.p2pNetworkClientIdentity.node.config.webSocketsPort)

            thisObject.httpInterface = HTTP_INTERFACE_MODULE.newHttpInterface()
            thisObject.httpInterface.initialize()
            console.log('Desktop Client Http Interface ................................................ Listening at port ' + DK.desktopApp.p2pNetworkClientIdentity.node.config.webPort)
        }
    }
}
