exports.newDesktopApp = function newDesktopApp() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run() {
        /*
<<<<<<< HEAD
                let socialGraphService = NT.projects.network.modules.socialGraph.newSocialGraph()
                await socialGraphService.initialize()
        */
=======
        Heree we will store our running objects:
        */
        DK.running = {}
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef

        /*
        This is the Web Sockets client that interacts with the Superalgos Network.
        */
<<<<<<< HEAD
        //DK.webSocketsClient = SA.projects.network.modules.webSocketsClient.newNetworkModulesWebSocketsClient()
        //await DK.webSocketsClient.initialize()

        /* These are the Network Interfaces by which the UI interacts with the Desktop App.*/
        //let WEB_SOCKETS_INTERFACE = require('./webSocketsInterface.js')
        let HTTP_INTERFACE = require('./httpInterface.js')

        /*
        WEB_SOCKETS_INTERFACE = WEB_SOCKETS_INTERFACE.newWebSocketsInterface()
        WEB_SOCKETS_INTERFACE.initialize()
        console.log('Web Sockets Interface ....................................... Listening at port ' + global.env.CLIENT_WEB_SOCKETS_INTERFACE_PORT)
        */

        HTTP_INTERFACE = HTTP_INTERFACE.newHttpInterface()
        HTTP_INTERFACE.initialize()
        console.log('Http Interface .............................................. Listening at port ' + global.env.DESKTOP_HTTP_INTERFACE_PORT)

        return

=======
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
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef

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
