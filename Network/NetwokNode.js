exports.newNetworkNode = function newNetworkNode() {

    let thisObject = {
        run: run
    }

    return thisObject

    function run() {
        /*
        Let's start the Network Interfaces
        */
        NT.webSocketsInterface = NT.projects.network.modules.webSocketsInterface.newNetworkModulesWebSocketsInterface()
        NT.webSocketsInterface.initialize()

        start()

        async function start() {
            let socialGraphService = NT.projects.network.modules.socialGraph.newSocialGraph()
            await socialGraphService.initialize()
        }

    }
}
