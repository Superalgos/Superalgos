const createError = require('http-errors');

exports.newSocialTradingModulesWebAppInterface = function newSocialTradingModulesWebAppInterface() {
    /*
    This module handles the incoming messages from the Web App.
    At it's current version, it will just forward those messages
    to the Network Node it is connected to.

    Later, it will try to use the personal social graph as a cache,
    so as to minimize the requests to Network Nodes.
    */
    let thisObject = {
        messageReceived: messageReceived,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        let appBootstrapingProcess = SA.projects.socialTrading.modules.appBootstrapingProcess.newSocialTradingAppBootstrapingProcess()
        appBootstrapingProcess.run()
    }

    async function messageReceived(message) {
        let messageHeader
        try {
            messageHeader = JSON.parse(message)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'messageHeader Not Correct JSON Format.'
            }
            return JSON.stringify(response)
        }

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
                }
                messageHeader.queryMessage = JSON.stringify(queryMessage)

                let response

                // console.log((new Date()).toISOString(), '- Web App Interface', '- Query Message Received', JSON.stringify(queryMessage))

                switch (queryMessage.queryType) {
                    case SA.projects.socialTrading.globals.queryTypes.SOCIAL_PERSONA_DATA: {

                        if (!queryMessage.userProfileId & !queryMessage.username) {
                            queryMessage.userProfileId = SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).userProfileId;
                            queryMessage.username = SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).userProfileHandle;
                        }

                        response = await getUserProfileData(queryMessage.username, queryMessage.userProfileId)

                        break
                    }
                    case SA.projects.socialTrading.globals.queryTypes.EVENTS: {

                        let events = await DK.desktopApp.p2pNetworkPeers.sendMessage(JSON.stringify(messageHeader))
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
                            data: await DK.desktopApp.p2pNetworkPeers.sendMessage(JSON.stringify(messageHeader))
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
                        eventMessage
                    )
                    /*
                    If we could not save the Post using the Open Storage, then there is no point in 
                    sending this message to the P2P Network.
                    */
                    if (response.result !== "Ok") {
                        return response
                    }
                }

                if (eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_USER_PROFILE) {
                    let commitMessage = "Edit User Profile";
                    eventMessage.originPostHash = await saveUserAtStorage(
                        SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).userProfileId,
                        eventMessage.body,
                        commitMessage
                    )
                }
                messageHeader.eventMessage = JSON.stringify(eventMessage)

                let response = {
                    result: 'Ok',
                    message: 'Web App Interface Event Processed.',
                    data: await DK.desktopApp.p2pNetworkPeers.sendMessage(JSON.stringify(messageHeader))
                }
                return response
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
        eventMessage
    ) {

        return new Promise(savePostAsync)

        async function savePostAsync(resolve, reject) {
            /*
            Each Social Entity must have a Storage Container so that we can here
            use it to save a Post content on it. 
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
                    message: 'Cannot Save Post Because Social Entity is Undefined'
                }
                resolve(response)
                return
            }

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

            let fileContent = JSON.stringify(file)
            let password = SA.projects.foundations.utilities.encryption.randomPassword()
            let encryptedFileContent = SA.projects.foundations.utilities.encryption.encrypt(fileContent, password)
            let fileName = web3.eth.accounts.hashMessage(encryptedFileContent)
            let filePath = SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(timestamp)
            let fileId = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
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
                        fileId: fileId,
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
                    /*
                    The content then will be saved at the next run of this function.
                    */
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
                            message: 'Storage Provider Failed to Save at least 1 File'
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

            let fileContent
            let notLoadedCount = 0

            for (let i = 0; i < fileKeys.length; i++) {

                if (fileContent !== undefined) { continue }

                let fileKey = fileKeys[i]
                /*
                We are going to load this file from the Storage Containers defined.
                We are going to try to read it first from the first Storage container
                and if it is not possible we will try with the next ones.
                */
                let fileName = fileKey.fileName
                let filePath = SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(fileKey.timestamp)
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
                    fileContent = SA.projects.foundations.utilities.encryption.decrypt(fileData, password)
                    let response = {
                        result: 'Ok',
                        message: 'Post Text Found',
                        postText: fileContent
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

    async function saveUserAtStorage(
        userProfileId,
        profileData,
        commitMessage
    ) {
        /*
        Each user, has a git repository that acts as his publicly accessible
        storage for posts.

        They way we store post there is first saving the data at the local disk
        which has a clone of the remote git repository, and once done, we push
        the changes to the public git repo.
        */
        const { createHash } = await import('crypto')
        const hash = createHash('sha256')

        const fileContent = JSON.stringify(userProfileId, undefined, 4)
        const fileHash = hash.update(fileContent).digest('hex')
        const fileName = fileHash + ".json"
        const filePath = './My-Social-Trading-Data/User-Profile/';

        SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath + '/')
        SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, JSON.stringify(profileData))

        const options = {
            baseDir: process.cwd() + '/My-Social-Trading-Data',
            binary: 'git',
            maxConcurrentProcesses: 6,
        }
        const git = SA.nodeModules.simpleGit(options)

        await git.add('./*')
        await git.commit(commitMessage)
        await git.push('origin')
        return fileHash
    }

    async function getUserProfileData(userProfileHandle, userProfileId) {

        const { createHash } = await import('crypto')
        const hash = createHash('sha256')
        const fileContent = JSON.stringify(userProfileId, undefined, 4)
        const fileHash = hash.update(fileContent).digest('hex')
        const fileName = fileHash + ".json";

        /*
        When the Web App makes a query that includes User Profile Data as responses,
        we need to fetch the text from the public git repositories, since
        the Network Nodes do not store that info themselves, they just
        store the structure of the social graph.
        */
        let promise = new Promise((resolve, reject) => {

            const filePath = 'My-Social-Trading-Data/main/User-Profile/'

            const fetch = SA.nodeModules.nodeFetch
            let url = 'https://raw.githubusercontent.com/' + userProfileHandle + '/' + filePath + '/' + fileName

            fetch(url)
                .then((response) => {

                    if (response.status != 200) {
                        console.log("getUserProfileData", 'Github.com responded with status ', response.status, 'url', url)
                        throw new createError.NotFound();
                    }

                    response.text().then(body => {
                        userProfile = JSON.parse(body);
                        userProfile.userProfileId = userProfileId;
                        userProfile.username = userProfileHandle;
                        resolve(responseData('Ok', 'Web App Interface Query Processed.', userProfile))
                    })
                })
                .catch(err => {
                    const response = { userProfileId: userProfileId, username: userProfileHandle }
                    resolve(responseData('Ok', 'Web App Interface Query Processed.', response, err));
                })

        }
        )

        return promise
    }

    async function responseData(result, message, data, error) {
        return {
            result: result,
            message: message,
            data: data,
            error: error
        };
    }
}