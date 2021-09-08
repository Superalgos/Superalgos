function newWebApp() {

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        try {
            setupRootObject()
            //setupHomePage()
        } catch (err) {
            console.log('[ERROR] initialize -> err.stack = ' + err.stack)
        }
    }

    function setupRootObject() {
        /*
        Here we will setup the UI object, with all the
        projects and spaces.
        */
        for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
            let projectDefinition = PROJECTS_SCHEMA[i]
            UI.projects[projectDefinition.propertyName] = {}
            let projectInstance = UI.projects[projectDefinition.propertyName]

            projectInstance.utilities = {}
            projectInstance.globals = {}
            projectInstance.functionLibraries = {}


            if (projectDefinition.UI === undefined) { continue }

            /* Set up Globals of this Project */
            if (projectDefinition.UI.globals !== undefined) {
                for (let j = 0; j < projectDefinition.UI.globals.length; j++) {
                    let globalDefinition = projectDefinition.UI.globals[j]

                    projectInstance.globals[globalDefinition.propertyName] = eval(globalDefinition.functionName + '()')
                }
            }

            /* Set up Utilities of this Project */
            if (projectDefinition.UI.utilities !== undefined) {
                for (let j = 0; j < projectDefinition.UI.utilities.length; j++) {
                    let utilityDefinition = projectDefinition.UI.utilities[j]

                    projectInstance.utilities[utilityDefinition.propertyName] = eval(utilityDefinition.functionName + '()')
                }
            }

            /* Set up Function Libraries of this Project */
            if (projectDefinition.UI.functionLibraries !== undefined) {
                for (let j = 0; j < projectDefinition.UI.functionLibraries.length; j++) {
                    let functionLibraryDefinition = projectDefinition.UI.functionLibraries[j]

                    projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = eval(functionLibraryDefinition.functionName + '()')
                }
            }
        }
    }

    async function setupHomePage() {
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
