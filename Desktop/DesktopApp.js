exports.newDesktopApp = function newDesktopApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run() {
        /*
        Heree we will store our running objects:
        */
        DK.running = {}

        /*
        This is the Web Sockets client that interacts with the Superalgos Network.
        */
        DK.running.socialGraph = DK.projects.socialTrading.modules.socialGraph.newSocialTradingModulesSocialGraph()
        await DK.running.socialGraph.initialize()

        /*
        This is the Web Sockets client that interacts with the Superalgos Network.
        */
        DK.running.webSocketsClient = SA.projects.network.modules.webSocketsClient.newNetworkModulesWebSocketsClient()
        await DK.running.webSocketsClient.initialize()
        console.log('Desktop Client Connected to Network Node via Web Sockets ................... Connected to port ' + global.env.NETWORK_WEB_SOCKETS_INTERFACE_PORT)

        /* These are the Network Interfaces by which the UI interacts with the Desktop App.*/

        DK.running.webSocketsInterface = DK.projects.socialTrading.modules.webSocketsInterface.newDesktopModulesWebSocketsInterface()
        DK.running.webSocketsInterface.initialize()
        console.log('Desktop Client Web Sockets Interface ....................................... Listening at port ' + global.env.CLIENT_WEB_SOCKETS_INTERFACE_PORT)


        DK.running.httpInterface = DK.projects.socialTrading.modules.httpInterface.newDesktopModulesHttpInterface()
        DK.running.httpInterface.initialize()
        console.log('Desktop Client Http Interface .............................................. Listening at port ' + global.env.DESKTOP_HTTP_INTERFACE_PORT)

        return

        let queryMessage
        let query
        /*
        Test Query User Profiles.
        */
        queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.USER_PROFILES,
            emitterUserProfileId: SA.secrets.map.get('Social Trading Desktop').userProfileId,
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

        async function showProfiles(profiles) {
            console.log(profiles)

            for (let i = 0; i < profiles.length; i++) {
                let profile = profiles[i]

                /*
                Test Following Profiles.
                */
                let eventMessage = {
                    eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    eventType: SA.projects.socialTrading.globals.eventTypes.FOLLOW_USER_PROFILE,
                    emitterUserProfileId: SA.secrets.map.get('Social Trading Desktop').userProfileId,
                    targetUserProfileId: profile.userProfileId
                }

                let event = {
                    requestType: 'Event',
                    eventMessage: JSON.stringify(eventMessage)
                }

                await DK.webSocketsClient.sendMessage(
                    JSON.stringify(event)
                )
                    .then(followAdded)
                    .catch(onError)

                function followAdded() {
                    console.log("User Profile " + profile.userProfileHandle + " followed.")
                }
            }
        }
        /*
        Test Query User Profile Stats.
        */
        queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.USER_PROFILE_STATS,
            emitterUserProfileId: SA.secrets.map.get('Social Trading Desktop').userProfileId,
            targetUserProfileId: SA.secrets.map.get('Social Trading Desktop').userProfileId
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
