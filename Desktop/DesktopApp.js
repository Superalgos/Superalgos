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
        await DK.webSocketsClient.initialize()

        let queryMessage
        let query
        /*
        Test Query User Profiles.
        */
        queryMessage = {
            queryType: 0,
            emitterUserProfileId: DK.TEST_NETWORK_CLIENT_USER_PROFILE_ID,
            initialIndex: 'Last',
            amountRequested: 10,
            direction: 'Past'
        }

        query = {
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        await DK.webSocketsClient.sendMessage(
            JSON.stringify(query)
        )
            .then(showProfiles)
            .catch(onError)

        function showProfiles(profiles) {
            console.log(profiles)
        }
        /*
        Test Query User Profile Stats.
        */
        queryMessage = {
            queryType: 1,
            emitterUserProfileId: DK.TEST_NETWORK_CLIENT_USER_PROFILE_ID,
            targetUserProfileId: DK.TEST_NETWORK_CLIENT_USER_PROFILE_ID
        }

        query = {
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        await DK.webSocketsClient.sendMessage(
            JSON.stringify(query)
        )
            .then(showProfilesStats)
            .catch(onError)

        function showProfilesStats(profile) {
            console.log(profile)
        }

        /*
        Error Handling
        */
        function onError(errorMessage) {
            console.log('[ERROR] Query not executed. ' + errorMessage)
        }
    }
}
