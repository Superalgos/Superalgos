function newWebApp() {

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    async function initialize() {
        try {
            setupRootObject(UI, 'UI')
            setupRootObject(SA, 'SA')
            await UI.projects.socialTrading.modules.webSocketsClient.initialize()
            setupHomePage()
        } catch (err) {
            console.log('[ERROR] initialize -> err.stack = ' + err.stack)
        }
    }

    function setupRootObject(rootObject, rootObjectName) {
        /*
        Here we will setup the UI object, with all the
        projects and spaces.
        */
        for (let i = 0; i < UI.schemas.projectSchema.length; i++) {
            let projectDefinition = UI.schemas.projectSchema[i]
            rootObject.projects[projectDefinition.propertyName] = {}
            let projectInstance = rootObject.projects[projectDefinition.propertyName]

            projectInstance.utilities = {}
            projectInstance.globals = {}
            projectInstance.functionLibraries = {}
            projectInstance.modules = {}

            if (projectDefinition[rootObjectName] === undefined) { continue }

            /* Set up Globals of this Project */
            if (projectDefinition[rootObjectName].globals !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].globals.length; j++) {
                    let globalDefinition = projectDefinition[rootObjectName].globals[j]

                    if (exports[globalDefinition.functionName] === undefined) {
                        projectInstance.globals[globalDefinition.propertyName] = eval(globalDefinition.functionName + '()')
                    } else {
                        projectInstance.globals[globalDefinition.propertyName] = eval('exports.' + globalDefinition.functionName + '()')
                    }
                }
            }

            /* Set up Utilities of this Project */
            if (projectDefinition[rootObjectName].utilities !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].utilities.length; j++) {
                    let utilityDefinition = projectDefinition[rootObjectName].utilities[j]

                    if (exports[utilityDefinition.functionName] === undefined) {
                        projectInstance.utilities[utilityDefinition.propertyName] = eval(utilityDefinition.functionName + '()')
                    } else {
                        projectInstance.utilities[utilityDefinition.propertyName] = eval('exports.' + utilityDefinition.functionName + '()')
                    }
                }
            }

            /* Set up Function Libraries of this Project */
            if (projectDefinition[rootObjectName].functionLibraries !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].functionLibraries.length; j++) {
                    let functionLibraryDefinition = projectDefinition[rootObjectName].functionLibraries[j]

                    if (exports[functionLibraryDefinition.functionName] === undefined) {
                        projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = eval(functionLibraryDefinition.functionName + '()')
                    } else {
                        projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = eval('exports.' + functionLibraryDefinition.functionName + '()')
                    }
                }
            }

            /* Set up Modules of this Project */
            if (projectDefinition[rootObjectName].modules !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].modules.length; j++) {
                    let functionLibraryDefinition = projectDefinition[rootObjectName].modules[j]

                    if (exports[functionLibraryDefinition.functionName] === undefined) {
                        projectInstance.modules[functionLibraryDefinition.propertyName] = eval(functionLibraryDefinition.functionName + '()')
                    } else {
                        projectInstance.modules[functionLibraryDefinition.propertyName] = eval('exports.' + functionLibraryDefinition.functionName + '()')
                    }
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
            emitterUserProfileId: undefined,
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
            document.getElementById('context-cell')

            fillWhoToFollowTable(profiles)
        }

        /*
        Error Handling
        */
        function onError(errorMessage) {
            console.log('[ERROR] Query not executed. ' + errorMessage)
        }
    }

    function fillWhoToFollowTable(profiles) {

        let contextCell = document.getElementById('context-cell')
        let table = document.createElement("table")
        let tblBody = document.createElement("tbody")

        for (let i = 0; i < profiles.length; i++) {
            let profile = profiles[i]
            let row = document.createElement("tr")

            let cell = document.createElement("td")
            let cellText = document.createTextNode(profile.userProfileHandle)
            cell.appendChild(cellText)
            row.appendChild(cell)

            tblBody.appendChild(row)
        }

        table.appendChild(tblBody)
        contextCell.appendChild(table)
        table.setAttribute("class", "who-to-follow-table")
    }
}
