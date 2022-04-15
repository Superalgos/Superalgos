exports.newDesktopApp = function newDesktopApp() {

    let thisObject = {
        webSocketsInterface: undefined,
        httpInterface: undefined,
        webAppInterface: undefined,
        p2pNetworkInterface: undefined,
        p2pNetworkClient: undefined,
        run: run
    }

    DK.desktopApp = thisObject

    return thisObject

    async function run() {

        /* Desktop App Interfaces */
        let WEB_SOCKETS_INTERFACE_MODULE = require('./Client/webSocketsInterface.js')
        let HTTP_INTERFACE_MODULE = require('./Client/httpInterface.js')
        let WEB_APP_INTERFACE_MODULE = require('./Client/webAppInterface.js')
        let P2P_NETWORK_INTERFACE_MODULE = require('./Client/p2pNetworkInterface.js')

        await initialSetupInterfaces()
        await setupNetwork()
        await finalSetupInterfaces()

        /*
        Test Message
        
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.CREATE_SOCIAL_ENTITY,
            socialEntityHandle: 'Pepe',
            socialEntityType: 'Social Persona',
            userAppType: 'Social Trading Desktop App'
        }

        let testMessage = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }
        
        let response = await thisObject.webAppInterface.sendMessage(JSON.stringify(testMessage))
        console.log(response)
        */

        async function initialSetupInterfaces() {
            /*
            This is what we are going to use to send messages to the P2P Network.
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
            await thisObject.p2pNetworkClient.initialize(
                global.env.DESKTOP_APP_SIGNING_ACCOUNT,
                global.env.DESKTOP_TARGET_NETWORK_TYPE,
                global.env.DESKTOP_TARGET_NETWORK_CODENAME,
                global.env.DESKTOP_APP_MAX_OUTGOING_PEERS,
                global.env.DESKTOP_APP_MAX_OUTGOING_START_PEERS,
                thisObject.p2pNetworkInterface.eventReceived
            )
        }

        async function finalSetupInterfaces() {
            /* 
            These are the Network Interfaces by which the Web App interacts with this Desktop Client.
            */
            thisObject.webSocketsInterface = WEB_SOCKETS_INTERFACE_MODULE.newWebSocketsInterface()
            thisObject.webSocketsInterface.initialize()
            console.log('Desktop Client Web Sockets Interface ......................................... Listening at port ' + DK.desktopApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webSocketsPort)

            thisObject.httpInterface = HTTP_INTERFACE_MODULE.newHttpInterface()
            thisObject.httpInterface.initialize()
            console.log('Desktop Client Http Interface ................................................ Listening at port ' + DK.desktopApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort)
        }
    }
}
