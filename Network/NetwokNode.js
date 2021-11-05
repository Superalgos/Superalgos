exports.newNetworkNode = function newNetworkNode() {

    let thisObject = {
        webSocketsInterface: undefined,
        socialGraphService: undefined,
        storage: undefined,
        p2pNetwork: undefined,
        run: run
    }

    NT.networkNode = thisObject

    return thisObject

    async function run() {
        /*
        The Social Graph Service is the first and for now, the only service this Network Node provides.
        */
        thisObject.socialGraphService = NT.projects.socialTrading.modules.socialGraph.newNetworkModulesSocialGraph()
        await thisObject.socialGraphService.initialize()
        /*
        The Sotrage deals with persisting the Social Graph.
        */
        thisObject.storage = NT.projects.socialTrading.modules.storage.newSocialTradingModulesStorage()
        thisObject.storage.initialize()
        /*
        We can join now the P2P Network as a new peer there.
        */
        thisObject.p2pNetwork = SA.projects.network.modules.p2pNetwork.newNetworkModulesP2PNetwork()
        await thisObject.p2pNetwork.initialize('Network Peer')
        /*
        Other Network Nodes and Client Apps will communicate with this Network Node via it's Websocket Interface.
        */
       thisObject.webSocketsInterface = NT.projects.network.modules.webSocketsInterface.newNetworkModulesWebSocketsInterface()
       thisObject.webSocketsInterface.initialize()
       console.log('Network Node Web Sockets Interface ....................................... Listening at port ' + JSON.parse(NT.networkNode.p2pNetwork.thisNetworkNode.node.config).webSocketsPort)

    }
}
