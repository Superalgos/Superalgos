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

        let request = {
            equeryId: "123",
            queryType: 0,
            emitterUserProfileId: DK.TEST_NETWORK_CLIENT_USER_PROFILE_ID,
            initialIndex: 'Last',
            amountRequested: 10,
            direction: 'Past'
        }
        DK.webSocketsClient.sendMessage(
            JSON.stringify(request),
            onResponse
        )

        function onResponse(message) {
            let profiles = JSON.parse(message)
            console.log(profiles)
        }
    }
}
