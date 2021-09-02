exports.newDesktopApp = function newDesktopApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    function run() {
        /*
        Let's start the Network Interfaces
        */
        DK.webSocketsClient = SA.projects.network.modules.webSocketsClient.newNetworkModulesWebSocketsClient()
        DK.webSocketsClient.initialize()


        return
        start()

        async function start() {
            let socialGraphService = NT.projects.network.modules.socialGraph.newSocialGraph()
            await socialGraphService.initialize()
        }

    }
}
