exports.newSocialTradingModulesSocialGraphNetworkServiceClient = function newSocialTradingModulesSocialGraphNetworkServiceClient() {
    /*
    This module represents the Client of the Social Graph Network Service
    running inside P2P Network Nodes.
    */
    let thisObject = {
        userAppSigningAccountCodeName: undefined,
        socialGraphNetworkServiceProxy: undefined,
        p2pNetworkInterface: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.userAppSigningAccountCodeName = undefined
        thisObject.socialGraphNetworkServiceProxy = undefined
        thisObject.p2pNetworkInterface = undefined
    }

    function initialize(
        userAppSigningAccountCodeName,
        socialGraphNetworkServiceProxy
    ) {

        thisObject.userAppSigningAccountCodeName = userAppSigningAccountCodeName
        thisObject.socialGraphNetworkServiceProxy = socialGraphNetworkServiceProxy

        let appBootstrapingProcess = SA.projects.socialTrading.modules.appBootstrapingProcess.newSocialTradingAppBootstrapingProcess()
        appBootstrapingProcess.run()
        /*
        This is where we will process all the events comming from the p2p network.
        */
        thisObject.p2pNetworkInterface = SA.projects.socialTrading.modules.p2pNetworkInterface.newSocialTradingModulesP2PNetworkInterface()
        thisObject.p2pNetworkInterface.initialize()
    }

    async function sendMessage(messageHeader) {

        switch (messageHeader.requestType) {
            case 'Query': {
                let queryMessage
                try {
                    queryMessage = JSON.parse(messageHeader.queryMessage)
                } catch (err) {
                    let response = {
                        result: 'Error',
                        message: 'queryMessage Not Correct JSON Format.'
                    }
                    return JSON.stringify(response)
                }
                /*
                The Origin in each message, is the Social Entity (Social Person or Social Trading Bot)
                that is producing the query. In other words, a User of a Social Trading App might have
                multiple Social Personas or Social Trading Bots. The one that is currently using while
                the query is executed is the one that should be specified at the message. If at this 
                point we have a message without a defined Social Persona, we will use the default one
                to retrieve it's id from the secrets file. 
                */
                if (queryMessage.originSocialPersonaId === undefined) {
                    queryMessage.originSocialPersonaId = SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_DEFAULT_SOCIAL_PERSONA).nodeId
                    console.log('DEPRECATION WARNING: You need to send the queryMessage.originSocialPersonaId at your QUERY Message because adding a default one will be deprecated at the next release.')
                }
                messageHeader.queryMessage = JSON.stringify(queryMessage)

                let response

                // console.log((new Date()).toISOString(), '- Web App Interface', '- Query Message Received', JSON.stringify(queryMessage))

                switch (queryMessage.queryType) {

                    case SA.projects.socialTrading.globals.queryTypes.EVENTS: {
                        /*
                        We go to the Social Graph Network Service to fetch the events.
                        */
                        let events = await thisObject.socialGraphNetworkServiceProxy.sendMessage(JSON.stringify(messageHeader))
                        let eventsWithNoProblem = []
                        /*
                        For events that contains Posts, we need to go to the Open Storage to retrieve those posts.
                        */
                        for (let i = 0; i < events.length; i++) {
                            let event = events[i]
                            if (
                                event.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_SOCIAL_PERSONA_POST ||
                                event.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_PERSONA_POST ||
                                event.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_SOCIAL_PERSONA_POST ||
                                event.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_SOCIAL_TRADING_BOT_POST ||
                                event.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_TRADING_BOT_POST ||
                                event.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_SOCIAL_TRADING_BOT_POST
                            ) {
                                let response = await SA.projects.socialTrading.functionLibraries.postsStorage.loadPostFromStorage(event.fileKeys)

                                if (response.result === "Ok") {
                                    event.postText = response.postText
                                    eventsWithNoProblem.push(event)
                                }
                            } else {
                                eventsWithNoProblem.push(event)
                            }
                        }

                        response = {
                            result: 'Ok',
                            message: 'Web App Interface Query Processed.',
                            data: eventsWithNoProblem
                        }

                        break
                    }
                    case SA.projects.socialTrading.globals.queryTypes.POST_REPLIES: {
                        /*
                        We go to the Social Graph Network Service to fetch the posts.
                        */
                        let posts = await thisObject.socialGraphNetworkServiceProxy.sendMessage(JSON.stringify(messageHeader))
                        let postsWithNoProblem = []
                        /*
                        We need to go to the Open Storage to retrieve those posts.
                        */
                        for (let i = 0; i < posts.length; i++) {
                            let post = posts[i]

                            let response = await SA.projects.socialTrading.functionLibraries.postsStorage.loadPostFromStorage(post.fileKeys)

                            if (response.result === "Ok") {
                                post.postText = response.postText
                                postsWithNoProblem.push(post)
                            }
                        }
                        response = {
                            result: 'Ok',
                            message: 'Web App Interface Query Processed.',
                            data: postsWithNoProblem
                        }

                        break
                    }
                    case SA.projects.socialTrading.globals.queryTypes.POSTS: {
                        /*
                        We go to the Social Graph Network Service to fetch the posts.
                        */
                        let posts = await thisObject.socialGraphNetworkServiceProxy.sendMessage(JSON.stringify(messageHeader))
                        let postsWithNoProblem = []
                        /*
                        We need to go to the Open Storage to retrieve those posts.
                        */
                        for (let i = 0; i < posts.length; i++) {
                            let post = posts[i]

                            let response = await SA.projects.socialTrading.functionLibraries.postsStorage.loadPostFromStorage(post.fileKeys)

                            if (response.result === "Ok") {
                                post.postText = response.postText
                                postsWithNoProblem.push(post)
                            }
                        }
                        response = {
                            result: 'Ok',
                            message: 'Web App Interface Query Processed.',
                            data: postsWithNoProblem
                        }

                        break
                    }
                    case SA.projects.socialTrading.globals.queryTypes.POST: {
                        /*
                        At this query, we go to the Social Graph, because we need the fileKeys to locate the Post content
                        at the Open Storage.
                        */
                        let post = await thisObject.socialGraphNetworkServiceProxy.sendMessage(JSON.stringify(messageHeader))
                        response = await SA.projects.socialTrading.functionLibraries.postsStorage.loadPostFromStorage(post.fileKeys)

                        if (response.result === "Ok") {
                            post.postText = response.postText
                        }

                        response = {
                            result: 'Ok',
                            message: 'Web App Interface Query Processed.',
                            data: post
                        }
                        break
                    }
                    default: {
                        /*
                        In general, all Queries go to the P2P Network to fetch information from the Social Graph. 
                        Though, there are a few exceptions.
                        */
                        response = {
                            result: 'Ok',
                            message: 'Web App Interface Query Processed.',
                            data: await thisObject.socialGraphNetworkServiceProxy.sendMessage(JSON.stringify(messageHeader))
                        }
                        break
                    }
                }

                // console.log((new Date()).toISOString(), '- Web App Interface', '- Query Response Sent', JSON.stringify(response))

                return response
            }
            case 'Event': {
                let eventMessage
                try {
                    eventMessage = JSON.parse(messageHeader.eventMessage)
                } catch (err) {
                    let response = {
                        result: 'Error',
                        message: 'eventMessage Not Correct JSON Format.'
                    }
                    return JSON.stringify(response)
                }
                /*
                The Origin in each message, is the Social Entity (Social Person or Social Trading Bot)
                that is producing the event. In other words, a User of a Social Trading App might have
                multiple Social Personas or Social Trading Bots. The one that is currently using while
                the event is executed is the one that should be specified at the message. If at this 
                point we have a message without a defined Social Persona, we will use the default one
                to retrieve it's id from the secrets file. 
                */
                if (eventMessage.originSocialPersonaId === undefined) {
                    eventMessage.originSocialPersonaId = SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_DEFAULT_SOCIAL_PERSONA).nodeId
                    console.log('DEPRECATION WARNING: You need to send the queryMessage.originSocialPersonaId at your EVENT Message because adding a default one will be deprecated at the next release.')
                }
                /*
                We need the Origin Social Entity so as to be able to sign this event. And for Post related
                events in order to locate the Available Storage. 
                */
                let socialEntity
                if (eventMessage.originSocialPersonaId !== undefined) {
                    let socialEntityId = eventMessage.originSocialPersonaId
                    socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(socialEntityId)
                }
                if (eventMessage.originSocialTradingBotId !== undefined) {
                    let socialEntityId = eventMessage.originSocialTradingBotId
                    socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(socialEntityId)
                }
                /*
                Some Validations
                */
                if (socialEntity === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'Cannot Locate the Origin Social Entity'
                    }
                    return response
                }
                /*
                Based on the Event Type we might need to do some stuff before reaching out to the P2P Network.
                */
                if (
                    eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_SOCIAL_PERSONA_POST ||
                    eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_PERSONA_POST ||
                    eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_SOCIAL_PERSONA_POST ||
                    eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_SOCIAL_TRADING_BOT_POST ||
                    eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_TRADING_BOT_POST ||
                    eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_SOCIAL_TRADING_BOT_POST
                ) {
                    /*
                    We need to save the post at the User's storage conatiner and remove adapt the message 
                    before sending it to the Network Node.
                    */
                    let response = await SA.projects.socialTrading.functionLibraries.postsStorage.savePostAtStorage(
                        eventMessage,
                        socialEntity
                    )
                    /*
                    If we could not save the Post using the Open Storage, then there is no point in 
                    sending this message to the P2P Network.
                    */
                    if (response.result !== "Ok") {
                        console.log('[WARN] Post could not be saved. Reason: ' + response.message)
                        return response
                    }
                }
                /*
                Timestamp is required so that the Signature is not vulnerable to Man in the Middle attacks.
                */
                if (eventMessage.timestamp === undefined) {
                    eventMessage.timestamp = (new Date()).valueOf()
                }
                messageHeader.eventMessage = JSON.stringify(eventMessage)
                /*
                Social Entity Signature is required in order for this event to be considered at all 
                nodes of the P2P network and not only at the one we are connected to.
                */
                let web3 = new SA.nodeModules.web3()
                messageHeader.signature = web3.eth.accounts.sign(messageHeader.eventMessage, SA.secrets.signingAccountSecrets.map.get(socialEntity.node.config.codeName).privateKey)
                /*
                At this point we are going to send the message via this Proxy to the Social Graph Network Service
                */
                let response = {
                    result: 'Ok',
                    message: 'Web App Interface Event Processed.',
                    data: await thisObject.socialGraphNetworkServiceProxy.sendMessage(JSON.stringify(messageHeader))
                }
                return response
            }
            case 'Profile': {
                let profileMessage
                try {
                    profileMessage = JSON.parse(messageHeader.profileMessage)
                } catch (err) {
                    let response = {
                        result: 'Error',
                        message: 'profileMessage Not Correct JSON Format.'
                    }
                    return JSON.stringify(response)
                }
                /*
                The Origin in each message, is the Social Entity (Social Person or Social Trading Bot)
                that is producing the event. In other words, a User of a Social Trading App might have
                multiple Social Personas or Social Trading Bots. The one that is currently using while
                the event is executed is the one that should be specified at the message. If at this 
                point we have a message without a defined Social Persona, we will use the default one
                to retrieve it's id from the secrets file. 
                */
                if (profileMessage.originSocialPersonaId === undefined) {
                    profileMessage.originSocialPersonaId = SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_DEFAULT_SOCIAL_PERSONA).nodeId
                    console.log('DEPRECATION WARNING: You need to send the queryMessage.originSocialPersonaId at your EVENT Message because adding a default one will be deprecated at the next release.')
                }

                switch (profileMessage.profileType) {
                    case SA.projects.socialTrading.globals.profileTypes.CREATE_USER_PROFILE: {
                        return await createUserProfile(
                            profileMessage
                        )
                    }
                    case SA.projects.socialTrading.globals.profileTypes.CREATE_SOCIAL_ENTITY: {
                        return await createSocialEntity(
                            profileMessage
                        )
                    }
                    case SA.projects.socialTrading.globals.profileTypes.DELETE_SOCIAL_ENTITY: {
                        return await deleteSocialEntity(
                            profileMessage
                        )
                    }
                    case SA.projects.socialTrading.globals.profileTypes.LIST_SOCIAL_ENTITIES: {
                        return await listSocialEntities(
                            profileMessage
                        )
                    }
                    case SA.projects.socialTrading.globals.profileTypes.SAVE_SOCIAL_ENTITY: {
                        return await saveSocialEntityAtStorage(
                            profileMessage
                        )
                    }
                    case SA.projects.socialTrading.globals.profileTypes.LOAD_SOCIAL_ENTITY: {
                        return await loadSocialEntityFromStorage(
                            profileMessage
                        )
                    }
                    default: {
                        let response = {
                            result: 'Error',
                            message: 'profileType Not Supported.'
                        }
                        return JSON.stringify(response)
                    }
                }
            }
            default: {
                let response = {
                    result: 'Error',
                    message: 'requestType Not Supported.'
                }
                return JSON.stringify(response)
            }
        }
    }

    async function createUserProfile() {
        /*
        These are the properties at the message that we expect here:

        storageProviderName             Must be "Github" for now, because it is the only storage provider we are currently working with.        
        storageProviderUsername         Must be the Github username, not email or anything else.
        storageProviderToken            Must be a valid Github Token.
        userAppType                     Possible values for this field are: "Social Trading Desktop App", "Social Trading Mobile App"
              
        At this function we are going to:

        1. We will check if the storageProviderName has a fork of Superalgos already created. If not, we will create the fork.
        2. We will check at the fork for the User Profile and read that file if exists. 
        3. If the user profile file does not exist, then we are going to create it. 
        4. Add to the User Profile the User App based on userAppType.
        5. Create a Storage Container for "My-Social-Trading-Data".
        6. Create the Signing Accounts.

        */
    }

    async function createSocialEntity() {

    }

    async function deleteSocialEntity() {

    }

    async function listSocialEntities() {

    }

    async function saveSocialEntityAtStorage(
        profileMessage
    ) {
        /*
        At this function we are going to save a Social Entity Profile using
        the Open Storage. The message format expected is:

        profileMessage = {
            originSocialPersonaId: "",      // Id of the Social Persona to be saved.
            profileData: "",                // Stringified version of the profile data to be saved. 
            profileType: SA.projects.socialTrading.globals.profileTypes.SAVE_SOCIAL_ENTITY
        }
        */

        return new Promise(saveSocialEntityAsync)

        async function saveSocialEntityAsync(resolve, reject) {
            /*
            Each Social Entity must have a Storage Container so that we can here
            use it to save content on it. 
            */
            let socialEntity
            if (profileMessage.originSocialPersonaId !== undefined) {
                let socialEntityId = profileMessage.originSocialPersonaId
                socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(socialEntityId)
            }
            if (profileMessage.originSocialTradingBotId !== undefined) {
                let socialEntityId = profileMessage.originSocialTradingBotId
                socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(socialEntityId)
            }
            /*
            Some Validations
            */
            if (socialEntity === undefined) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Save Social Entity Profile Because Social Entity is Undefined'
                }
                resolve(response)
                return
            }

            let availableStorage = socialEntity.node.availableStorage
            if (availableStorage === undefined) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Save Social Entity Profile Because Available Storage is Undefined'
                }
                resolve(response)
                return
            }

            if (availableStorage.storageContainerReferences.length === 0) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Save Social Entity Profile Because Storage Container References is Zero'
                }
                resolve(response)
                return
            }
            /*
            Prepare the content to be saved
            */
            let fileContent = profileMessage.profileData
            let fileName = socialEntity.id
            let filePath = "Social-Entities"
            /*
            We are going to save this file at all of the Storage Containers defined.
            */
            let savedCount = 0
            let notSavedCount = 0

            for (let i = 0; i < availableStorage.storageContainerReferences.length; i++) {
                let storageContainerReference = availableStorage.storageContainerReferences[i]
                if (storageContainerReference.referenceParent === undefined) {
                    continue
                }
                if (storageContainerReference.referenceParent.parentNode === undefined) {
                    continue
                }

                let storageContainer = storageContainerReference.referenceParent

                switch (storageContainer.type) {
                    case 'Github Storage Container': {
                        await SA.projects.openStorage.utilities.githubStorage.saveFile(fileName, filePath, fileContent, storageContainer)
                            .then(onFileSaved)
                            .catch(onFileNodeSaved)
                        break
                    }
                    case 'Superalgos Storage Container': {
                        // TODO Build the Superalgos Storage Provider
                        break
                    }
                }

                function onFileSaved() {
                    savedCount++
                    if (savedCount + notSavedCount === availableStorage.storageContainerReferences.length) {
                        allFilesSaved()
                    }
                }

                function onFileNodeSaved() {
                    notSavedCount++
                    if (savedCount + notSavedCount === availableStorage.storageContainerReferences.length) {
                        allFilesSaved()
                    }
                }

                function allFilesSaved() {
                    if (savedCount > 0) {
                        let response = {
                            result: 'Ok',
                            message: 'Social Entity Saved'
                        }
                        resolve(response)
                    } else {
                        let response = {
                            result: 'Error',
                            message: 'Storage Provider Failed to Save at least 1 Social Entity File'
                        }
                        resolve(response)
                    }
                }
            }
        }
    }

    async function loadSocialEntityFromStorage(
        profileMessage
    ) {
        /*
        When the Web App makes a query that includes Post text as responses,
        we need to fetch the text from the the storage container of the author
        of such posts, since the Network Nodes do not store that info themselves, 
        they just store the structure of the social graph.
        */
        return new Promise(loadSocialEntityAsync)

        async function loadSocialEntityAsync(resolve, reject) {
            /*
            Each Social Entity must have a Storage Container so that we can here
            use it to load content on it. 
            */
            let socialEntity
            if (profileMessage.originSocialPersonaId !== undefined) {
                let socialEntityId = profileMessage.originSocialPersonaId
                socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(socialEntityId)
            }
            if (profileMessage.originSocialTradingBotId !== undefined) {
                let socialEntityId = profileMessage.originSocialTradingBotId
                socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(socialEntityId)
            }
            /*
            Some Validations
            */
            if (socialEntity === undefined) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Load Social Entity Profile Because Social Entity is Undefined'
                }
                resolve(response)
                return
            }

            let availableStorage = socialEntity.node.availableStorage
            if (availableStorage === undefined) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Load Social Entity Profile Because Available Storage is Undefined'
                }
                resolve(response)
                return
            }

            if (availableStorage.storageContainerReferences.length === 0) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Load Social Entity Profile Because Storage Container References is Zero'
                }
                resolve(response)
                return
            }
            let file
            let notLoadedCount = 0

            for (let i = 0; i < availableStorage.storageContainerReferences.length; i++) {
                let storageContainerReference = availableStorage.storageContainerReferences[i]
                if (storageContainerReference.referenceParent === undefined) {
                    continue
                }
                if (storageContainerReference.referenceParent.parentNode === undefined) {
                    continue
                }

                let storageContainer = storageContainerReference.referenceParent

                if (file !== undefined) {
                    continue
                }
                /*
                We are going to load this file from the Storage Containers defined.
                We are going to try to read it first from the first Storage container
                and if it is not possible we will try with the next ones.
                */
                let fileName = socialEntity.id
                let filePath = "Social-Entities"

                switch (storageContainer.parentNode.type) {
                    case 'Github Storage': {
                        await SA.projects.openStorage.utilities.githubStorage.loadFile(fileName, filePath, storageContainer)
                            .then(onFileLoaded)
                            .catch(onFileNotLoaded)
                        break
                    }
                    case 'Superalgos Storage': {
                        // TODO Build the Superalgos Storage Provider
                        break
                    }
                }

                function onFileLoaded(fileData) {
                    file = fileData
                    let response = {
                        result: 'Ok',
                        message: 'Social Entity Profile Found',
                        profileData: file
                    }
                    resolve(response)
                }

                function onFileNotLoaded() {
                    notLoadedCount++
                    if (notLoadedCount === availableStorage.storageContainerReferences.length) {
                        let response = {
                            result: 'Error',
                            message: 'Social Entity Profile Not Available At The Moment'
                        }
                        resolve(response)
                    }
                }
            }
        }
    }
}