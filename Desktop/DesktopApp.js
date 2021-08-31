exports.newDesktopApp = function newDesktopApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    function run() {
        /*
        Let's start the Network Interfaces
        */
        DK.webSocketsClient = DK.projects.network.modules.webSocketsClient.newDesktopModulesWebSocketsClient()
        DK.webSocketsClient.initialize()


        return
        start()

        async function start() {
            let socialGraphService = NT.projects.network.modules.socialGraph.newSocialGraph()
            await socialGraphService.initialize()
        }

    }
}
