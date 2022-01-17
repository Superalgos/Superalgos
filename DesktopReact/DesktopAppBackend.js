exports.newDesktopAppBackend = function newDesktopAppBackend() {

    let thisObject = {
        webSocketsInterface: undefined,
        httpInterface: undefined,
        webAppInterface: undefined,
        p2pNetworkClient: undefined,
        run: run
    }

    DK.desktopApp = thisObject

    return thisObject

    async function run() {

        /* Desktop App Interfaces */
        let WEB_APP_INTERFACE_MODULE = require('./Client/webAppInterface.js')

        await setupNetwork()
        await setupInterfaces()

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
                eventReceived
            )
        }

        async function setupInterfaces() {
            /*
            This is where we will process all the messages comming from our web app.
            */
            thisObject.webAppInterface = WEB_APP_INTERFACE_MODULE.newWebAppInterface()
            thisObject.webAppInterface.initialize()
            /* 
            These are the Network Interfaces by which the Web App interacts with this Desktop Client.
            */
            let express = require('./backend/src/expressServer.js')
            express.DesktopBackend(DK.desktopApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort, SA, DK);
            console.log(`express Interface ................................................ Listening at port ${DK.desktopApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config.webPort}`);
        }

        function eventReceived(event) {
            console.log("This event has just arrived from the P2P Network: " + JSON.stringify(event))
        }
    }
}
