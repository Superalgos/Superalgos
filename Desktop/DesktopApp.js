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
        This is the Web Sockets client that interacts with the Superalgos Network.
        */
        /*
         DK.webSocketsClient = SA.projects.network.modules.webSocketsClient.newNetworkModulesWebSocketsClient()
         await DK.webSocketsClient.initialize()
        */

        /* These are the Network Interfaces by which the UI interacts with the Desktop App.*/
        //let WEB_SOCKETS_INTERFACE = require('./Client/webSocketsInterface.js')
        let HTTP_INTERFACE = require('./Client/httpInterface.js')

        /*
        WEB_SOCKETS_INTERFACE = WEB_SOCKETS_INTERFACE.newWebSocketsInterface()
        WEB_SOCKETS_INTERFACE.initialize()
        console.log('Web Sockets Interface ....................................... Listening at port ' + global.env.CLIENT_WEB_SOCKETS_INTERFACE_PORT)
        */

        HTTP_INTERFACE = HTTP_INTERFACE.newHttpInterface()
        HTTP_INTERFACE.initialize()
        console.log('Http Interface .............................................. Listening at port ' + global.env.DESKTOP_HTTP_INTERFACE_PORT)

        return

        let queryMessage
        let query
        /*
        Test Query User Profiles.
        */
        queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.USER_PROFILES,
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
                    emitterUserProfileId: DK.TEST_NETWORK_CLIENT_USER_PROFILE_ID,
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
