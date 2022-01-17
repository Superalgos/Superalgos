exports.newSocialTradingModulesSocialGraphNetworkServiceClient = function newSocialTradingModulesSocialGraphNetworkServiceClient() {
    /*
    This module represents the Client of the Social Graph Network Service
    running inside P2P Network Nodes.
    */
    let thisObject = {
        userAppSigningAccountCodeName: undefined,
        socialGraphNetworkServiceProxy: undefined,
        p2pNetworkInterface: undefined,
        messageReceived: messageReceived,
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

    async function messageReceived(messageHeader) {

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

                        let events = await thisObject.socialGraphNetworkServiceProxy.sendMessage(JSON.stringify(messageHeader))
                        let eventsWithNoProblem = []

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
                                let response = await loadPostFromStorage(event.fileKeys)

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
                    default: {
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
                    let response = await savePostAtStorage(
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

    async function savePostAtStorage(
        eventMessage,
        socialEntity
    ) {

        return new Promise(savePostAsync)

        async function savePostAsync(resolve, reject) {

            let availableStorage = socialEntity.node.availableStorage
            if (availableStorage === undefined) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Save Post Because Available Storage is Undefined'
                }
                resolve(response)
                return
            }

            if (availableStorage.storageContainerReferences.length === 0) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Save Post Because Storage Container References is Zero'
                }
                resolve(response)
                return
            }
            /*
            Prepare the content to be saved
            */
            let timestamp = (new Date()).valueOf()
            let file = {
                timestamp: timestamp,
                content: eventMessage.postText
            }

            let web3 = new SA.nodeModules.web3()
            let fileContent = JSON.stringify(file)
            let password = SA.projects.foundations.utilities.encryption.randomPassword()
            let encryptedFileContent = SA.projects.foundations.utilities.encryption.encrypt(fileContent, password)
            let fileName = web3.eth.accounts.hashMessage(encryptedFileContent)
            let filePath = "Posts/" + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(timestamp)
            /*
            We are going to save this file at all of the Storage Containers defined.
            */
            let savedCount = 0
            let notSavedCount = 0
            let fileKeys = []

            for (let i = 0; i < availableStorage.storageContainerReferences.length; i++) {
                let storageContainerReference = availableStorage.storageContainerReferences[i]
                if (storageContainerReference.referenceParent === undefined) { continue }
                if (storageContainerReference.referenceParent.parentNode === undefined) { continue }

                let storageContainer = storageContainerReference.referenceParent

                switch (storageContainer.type) {
                    case 'Github Storage Container': {
                        await SA.projects.openStorage.utilities.githubStorage.saveFile(fileName, filePath, encryptedFileContent, storageContainer)
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
                    let fileKey = {
                        timestamp: timestamp,
                        fileName: fileName,
                        storageContainerId: storageContainer.id,
                        password: password
                    }
                    fileKeys.push(fileKey)
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
                        /*
                        Here we modify the eventMessage that is going to continue its journey to 
                        the P2P Network Node.
                        */
                        eventMessage.originPostHash = fileName
                        /*
                        The post text is eliminated, since it is now at the user's storage,
                        and a hash of the content was generated, and that is what is going to
                        the Network Node.
                        */
                        eventMessage.postText = undefined
                        /*
                        The file key contains all the information needed to later retrieve this post.
                        */
                        eventMessage.fileKeys = fileKeys

                        let response = {
                            result: 'Ok',
                            message: 'Post Saved'
                        }
                        resolve(response)
                    } else {
                        let response = {
                            result: 'Error',
                            message: 'Storage Provider Failed to Save at least 1 Post File'
                        }
                        resolve(response)
                    }
                }
            }
        }
    }

    async function loadPostFromStorage(
        fileKeys
    ) {
        if (fileKeys === undefined) {
            let response = {
                result: 'Error',
                message: 'It is not possible to retrieve this post'
            }
            return response
        }
        /*
        When the Web App makes a query that includes Post text as responses,
        we need to fetch the text from the the storage container of the author
        of such posts, since the Network Nodes do not store that info themselves, 
        they just store the structure of the social graph.
        */
        return new Promise(loadPostAsync)

        async function loadPostAsync(resolve, reject) {

            let file
            let notLoadedCount = 0

            for (let i = 0; i < fileKeys.length; i++) {

                if (file !== undefined) { continue }

                let fileKey = fileKeys[i]
                /*
                We are going to load this file from the Storage Containers defined.
                We are going to try to read it first from the first Storage container
                and if it is not possible we will try with the next ones.
                */
                let fileName = fileKey.fileName
                let filePath = "Posts/" + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(fileKey.timestamp)
                let password = fileKey.password
                let storageContainer = SA.projects.network.globals.memory.maps.STORAGE_CONTAINERS_BY_ID.get(fileKey.storageContainerId)

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
                    file = JSON.parse(SA.projects.foundations.utilities.encryption.decrypt(fileData, password))
                    let response = {
                        result: 'Ok',
                        message: 'Post Text Found',
                        postText: file.content
                    }
                    resolve(response)
                }

                function onFileNotLoaded() {
                    notLoadedCount++
                    if (notLoadedCount === fileKeys.length) {
                        let response = {
                            result: 'Error',
                            message: 'Post Content Not Available At The Moment'
                        }
                        resolve(response)
                    }
                }
            }
        }
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
                if (storageContainerReference.referenceParent === undefined) { continue }
                if (storageContainerReference.referenceParent.parentNode === undefined) { continue }

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
                if (storageContainerReference.referenceParent === undefined) { continue }
                if (storageContainerReference.referenceParent.parentNode === undefined) { continue }

                let storageContainer = storageContainerReference.referenceParent

                if (file !== undefined) { continue }
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