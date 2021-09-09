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
            UI.projects.socialTrading.modules.webSocketsClient.initialize()
            setupHomePage()
        } catch (err) {
            console.log('[ERROR] initialize -> err.stack = ' + err.stack)
        }
    }

    function setupRootObject() {
        /*
        Here we will setup the UI object, with all the
        projects and spaces.
        */
        for (let i = 0; i < UI.schemas.projectSchema.length; i++) {
            let projectDefinition = UI.schemas.projectSchema[i]
            UI.projects[projectDefinition.propertyName] = {}
            let projectInstance = UI.projects[projectDefinition.propertyName]

            projectInstance.utilities = {}
            projectInstance.globals = {}
            projectInstance.functionLibraries = {}
            projectInstance.modules = {}

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

            /* Set up Modules of this Project */
            if (projectDefinition.UI.modules !== undefined) {
                for (let j = 0; j < projectDefinition.UI.modules.length; j++) {
                    let functionLibraryDefinition = projectDefinition.UI.modules[j]

                    projectInstance.modules[functionLibraryDefinition.propertyName] = eval(functionLibraryDefinition.functionName + '()')
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

        await UI.projects.socialTrading.modules.webSocketsClient.sendMessage(
            JSON.stringify(query)
        )
            .then(showProfiles)
            .catch(onError)

        async function showProfiles(profiles) {
            console.log(profiles)

            for (let i = 0; i < profiles.length; i++) {
                let profile = profiles[i]

                console.log(profile)
            }
        }

        /*
        Error Handling
        */
        function onError(errorMessage) {
            console.log('[ERROR] Query not executed. ' + errorMessage)
        }
    }
}
