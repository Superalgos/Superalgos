function newWebApp() {
    /*
    In it's current state of development, the Web App only has one module. 

    Everything is being coded here until some structure emerges. 
    */
    let thisObject = {
        messageReceived: messageReceived,
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
            await UI.projects.socialTrading.modules.webSocketsWebAppClient.initialize()
            loadWUserProfileTimeline()
            loadWhoToFollow()
            setupEventHandlers()
        } catch (err) {
            console.log('[ERROR] initialize -> err.stack = ' + err.stack)
        }
    }

    /*
        function setupRootObject(rootObject, rootObjectName) {
            /!*
            Here we will setup the UI object, with all the
            projects and spaces.
            *!/
            for (let i = 0; i < UI.schemas.projectSchema.length; i++) {
                let projectDefinition = UI.schemas.projectSchema[i]
                rootObject.projects[projectDefinition.propertyName] = {}
                let projectInstance = rootObject.projects[projectDefinition.propertyName]

                projectInstance.utilities = {}
                projectInstance.globals = {}
                projectInstance.functionLibraries = {}
                projectInstance.modules = {}

                if (projectDefinition[rootObjectName] === undefined) {
                    continue
                }

                /!* Set up Globals of this Project *!/
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

                /!* Set up Utilities of this Project *!/
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

                /!* Set up Function Libraries of this Project *!/
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

                /!* Set up Modules of this Project *!/
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
    */

    /*
        async function loadWUserProfileTimeline() {
            let queryMessage = {
                queryType: SA.projects.socialTrading.globals.queryTypes.EVENTS,
                emitterUserProfileId: undefined,
                initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_LAST,
                amountRequested: 100,
                direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST
            }

            let query = {
                requestType: 'Query',
                queryMessage: JSON.stringify(queryMessage)
            }

            await UI.projects.socialTrading.modules.webSocketsWebAppClient.sendMessage(
                JSON.stringify(query)
            )
                .then(console.log)
                .catch(onError)

            function onError(errorMessage) {
                console.log('[ERROR] Query not executed. ' + errorMessage)
                console.log('[ERROR] query = ' + JSON.stringify(query))
            }

            function addToContentDiv(events) {
                try {
                    let contentDiv = document.getElementById('content-div')
                    /!*
                    Delete al current content.
                    *!/
                    while (contentDiv.childNodes.length > 4) {
                        let childToRemove = contentDiv.childNodes[contentDiv.childNodes.length - 1]
                        contentDiv.removeChild(childToRemove)
                    }
                    /!*
                    Render the timeline.
                    *!/
                    for (let i = 0; i < events.length; i++) {
                        let event = events[i]

                        let postDiv = document.createElement("div")
                        postDiv.setAttribute("class", "post-div")
                        let textNode

                        switch (event.eventType) {
                            case SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST: {
                                textNode = document.createTextNode(event.emitterUserProfile.userProfileHandle + " POSTED " + event.postText)
                                break
                            }
                            case SA.projects.socialTrading.globals.eventTypes.FOLLOW_USER_PROFILE: {
                                textNode = document.createTextNode(event.emitterUserProfile.userProfileHandle + " FOLLOWED " + event.targetUserProfile.userProfileHandle)
                                break
                            }
                            case SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_USER_PROFILE: {
                                textNode = document.createTextNode(event.emitterUserProfile.userProfileHandle + " UNFOLLOWED " + event.targetUserProfile.userProfileHandle)
                                break
                            }
                        }

                        postDiv.appendChild(textNode)
                        contentDiv.appendChild(postDiv)
                    }
                }
                catch (err) {
                    console.log('[ERROR] err.stack = ' + err.stack)
                }
            }
        }
    */

    /*
        async function loadWhoToFollow() {
            let queryMessage = {
                queryType: SA.projects.socialTrading.globals.queryTypes.UNFOLLOWED_USER_PROFILES,
                emitterUserProfileId: undefined,
                initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST,
                amountRequested: 3,
                direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP
            }

            let query = {
                requestType: 'Query',
                queryMessage: JSON.stringify(queryMessage)
            }

            await UI.projects.socialTrading.modules.webSocketsWebAppClient.sendMessage(
                JSON.stringify(query)
            )
                .then(addWhoToFollowTable)
                .catch(onError)

            function onError(errorMessage) {
                console.log('[ERROR] Query not executed. ' + errorMessage)
                console.log('[ERROR] query = ' + JSON.stringify(query))
            }
        }
    */

    function setupEventHandlers() {
        /*
        Add events to process button clicks , and mouseWheel.
        */
        document.addEventListener("click", onClick)
        document.addEventListener('mousewheel', onMouseWheel, false)

        async function onClick(event) {

            if (event.target && event.target.nodeName === "BUTTON") {
                switch (event.target.name) {
                    case 'New Post': {
                        let textArea = document.getElementById("new-post-text-area")
                        await sendNewPostEvent(
                            textArea.value
                        )
                            .then(updateTextArea)
                            .catch(onError)

                        function updateTextArea() {
                            textArea.value = ""
                        }

                        break
                    }
                    case 'Follow Profile': {
                        await sendTargetUserProfileEvent(
                            event.target.userProfileId,
                            SA.projects.socialTrading.globals.eventTypes.FOLLOW_USER_PROFILE
                        )
                            .then(updateButton)
                            .catch(onError)

                        function updateButton() {
                            let span = document.getElementById('profile-to-follow-span-' + event.target.userProfileId)
                            let button = document.getElementById('profile-to-follow-button-' + event.target.userProfileId)
                            span.setAttribute("class", "profile-to-unfollow-span")
                            button.setAttribute("class", "profile-to-unfollow-button")
                            button.name = 'Unfollow Profile'
                        }

                        break
                    }
                    case 'Unfollow Profile': {
                        await sendTargetUserProfileEvent(
                            event.target.userProfileId,
                            SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_USER_PROFILE
                        )
                            .then(updateButton)
                            .catch(onError)

/*
                        function updateButton() {
                            let span = document.getElementById('profile-to-follow-span-' + event.target.userProfileId)
                            let button = document.getElementById('profile-to-follow-button-' + event.target.userProfileId)
                            span.setAttribute("class", "profile-to-follow-span")
                            button.setAttribute("class", "profile-to-follow-button")
                            button.name = 'Follow Profile'
                        }
*/

                        break
                    }
                }
            }

            /*
            Error Handling
            */
            function onError(errorMessage) {
                console.log('[ERROR] Click event failed. ' + errorMessage)
            }
        }

        function onMouseWheel(event) {
            let scrollDiv = document.getElementById("scroll-div")
            scrollDiv.scrollTop = scrollDiv.scrollTop + event.deltaY
        }
    }

    async function sendTargetUserProfileEvent(
        userProfileId,
        eventType
    ) {

        return new Promise((resolve, reject) => {
            asyncCall(resolve, reject)
        })

        async function asyncCall(resolve, reject) {
            let eventMessage
            let event

            eventMessage = {
                eventType: eventType,
                eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                targetUserProfileId: userProfileId,
                timestamp: (new Date()).valueOf()
            }

            event = {
                requestType: 'Event',
                eventMessage: JSON.stringify(eventMessage)
            }

            await UI.projects.socialTrading.modules.webSocketsWebAppClient.sendMessage(
                JSON.stringify(event)
            )
                .then(resolve)
                .catch(onError)

            function onError(errorMessage) {
                console.log('[ERROR] Event not executed. ' + errorMessage)
                console.log('[ERROR] event = ' + JSON.stringify(event))
                reject(errorMessage)
            }
        }
    }

    async function sendNewPostEvent(
        postText
    ) {

        return new Promise((resolve, reject) => {
            asyncCall(resolve, reject)
        })

        async function asyncCall(resolve, reject) {
            let eventMessage
            let event

            eventMessage = {
                eventType: SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST,
                eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                postText: postText,
                timestamp: (new Date()).valueOf()
            }

            event = {
                requestType: 'Event',
                eventMessage: JSON.stringify(eventMessage)
            }

            await UI.projects.socialTrading.modules.webSocketsWebAppClient.sendMessage(
                JSON.stringify(event)
            )
                .then(resolve)
                .catch(onError)

            function onError(errorMessage) {
                console.log('[ERROR] Event not executed. ' + errorMessage)
                console.log('[ERROR] event = ' + JSON.stringify(event))
                reject(errorMessage)
            }
        }
    }

    function messageReceived(message) {
        window.alert(message)
    }
}
