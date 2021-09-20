exports.newNetworkNode = function newNetworkNode() {

    let thisObject = {
        socialGraphService: undefined,
        storage: undefined,
        run: run
    }

    return thisObject

    async function run() {
        /*
        Let's start the Network Interfaces
        */
        NT.webSocketsInterface = NT.projects.network.modules.webSocketsInterface.newNetworkModulesWebSocketsInterface()
        NT.webSocketsInterface.initialize()

        thisObject.socialGraphService = NT.projects.socialTrading.modules.socialGraph.newNetworkModulesSocialGraph()
        await thisObject.socialGraphService.initialize()

        thisObject.storage = NT.projects.socialTrading.modules.storage.newSocialTradingModulesStorage()
        thisObject.storage.initialize()
    }
}
