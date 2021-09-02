exports.newDesktopApp = function newDesktopApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run() {
/*
        let socialGraphService = NT.projects.network.modules.socialGraph.newSocialGraph()
        await socialGraphService.initialize()
*/
        /*
        Let's start the Network Interfaces
        */
        DK.webSocketsClient = SA.projects.network.modules.webSocketsClient.newNetworkModulesWebSocketsClient()
        DK.webSocketsClient.initialize()

    }
}
