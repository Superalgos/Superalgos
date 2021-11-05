exports.newNetworkNode = function newNetworkNode() {

    let thisObject = {
        webSocketsInterface: undefined,
        socialGraphService: undefined,
        storage: undefined,
        p2pMetwork: undefined,
        run: run
    }

    NT.networkNode = thisObject

    return thisObject

    async function run() {
        /*
        Other Network Nodes and Client Apps will communicate with this Network Node via it's Websocket Interface.
        */
        thisObject.webSocketsInterface = NT.projects.network.modules.webSocketsInterface.newNetworkModulesWebSocketsInterface()
        thisObject.webSocketsInterface.initialize()
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
        thisObject.p2pMetwork = SA.projects.network.modules.p2pNetwork.newNetworkModulesP2PNetwork()
        await thisObject.p2pMetwork.initialize('Network Peer')
    }
}
