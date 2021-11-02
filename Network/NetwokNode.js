exports.newNetworkNode = function newNetworkNode() {

    let thisObject = {
        socialGraphService: undefined,
        storage: undefined,
        run: run
    }

    return thisObject

    async function run() {
        /*
        Other Network Nodes and Client Apps will communicate with this Network Node via it's Websocket Interface.
        */
        NT.webSocketsInterface = NT.projects.network.modules.webSocketsInterface.newNetworkModulesWebSocketsInterface()
        NT.webSocketsInterface.initialize()
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
    }
}
