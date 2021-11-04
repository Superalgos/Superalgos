exports.newDesktopApp = function newDesktopApp() {

    let thisObject = {
        socialGraph: undefined,
        p2pMetwork: undefined,
        webSocketsClient: undefined,
        webSocketsInterface: undefined,
        run: run
    }

    DK.desktopApp = thisObject

    return thisObject

    async function run() {
        /*
        This is the Personal Social Graph for the user running this App.
        */
        thisObject.socialGraph = DK.projects.socialTrading.modules.socialGraph.newSocialTradingModulesSocialGraph()
        await thisObject.socialGraph.initialize()
        /*
        We can join now the P2P Network as a client app.
        */
        thisObject.p2pMetwork = SA.projects.network.modules.p2pMetwork.newNetworkModulesP2PNetwork()
        await thisObject.p2pMetwork.initialize('Network Client')
        /*
        Here we will pick a Network Node from all users profiles available that do have a Network Node running. // TODO
        In the meantime, we will assume that we have chosen the following Network Node to connect to.
        */
        selectedNetworkNode = {
            userProfileHandle: "Luis-Fernando-Molina",
            blockchainAccount: "0xeBDCB7a73c4796ca9F025d005630eCe773dd9e54",
            ranking: 0,
            host: "localhost",
            port: global.env.NETWORK_WEB_SOCKETS_INTERFACE_PORT
        }
        /*
        This is the Web Sockets client that interacts with the Superalgos Network.
        */
        thisObject.webSocketsClient = SA.projects.network.modules.webSocketsAppClient.newNetworkModulesWebSocketsAppClient()
        await thisObject.webSocketsClient.initialize('Network Client', selectedNetworkNode)
        console.log('Desktop Client Connected to Network Node via Web Sockets ................... Connected to port ' + global.env.NETWORK_WEB_SOCKETS_INTERFACE_PORT)
        /* 
        These are the Network Interfaces by which the Web App interacts with this Desktop Client.
        */
        thisObject.webSocketsInterface = DK.projects.socialTrading.modules.webSocketsInterface.newDesktopModulesWebSocketsInterface()
        thisObject.webSocketsInterface.initialize()
        console.log('Desktop Client Web Sockets Interface ....................................... Listening at port ' + global.env.DESKTOP_WEB_SOCKETS_INTERFACE_PORT)


        thisObject.webSocketsClient = DK.projects.socialTrading.modules.httpInterface.newDesktopModulesHttpInterface()
        thisObject.httpInterface.initialize()
        console.log('Desktop Client Http Interface .............................................. Listening at port ' + global.env.DESKTOP_HTTP_INTERFACE_PORT)

    }
}
