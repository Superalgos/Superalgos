exports.newOpenStorageModulesOpenStorageNetworkClient = function newOpenStorageModulesOpenStorageNetworkClient() {
    /*
    This module receives a file to save, and it knows which are
    the available storages for the Network Node currently running.

    So it will pick one of the available and try to save the file there.
    If it does not succeed, it will try at the other available storage until
    it suceeds. 

    Once the file could be saved, it will return the id of the Storage Conatainer
    where the file is localted. 
    */
    let thisObject = {
        availableStorage: undefined,
        persistSocialGraph: persistSocialGraph,
        loadSocialGraphFile: loadSocialGraphFile,
        initialize: initialize,
        finalize: finalize
    }

    let web3
    let saveIntervalId
    let socialTradingBotsMap
    let candlesSignalsMap
    let saveOneFileCanRun
    let filesLoadedByIdMap

    return thisObject

    function finalize() {
        filesLoadedByIdMap = undefined
        socialTradingBotsMap = undefined
        candlesSignalsMap = undefined
        availableStorage = undefined
        web3 = undefined
        clearInterval(saveIntervalId)
    }

    async function initialize() {
        filesLoadedByIdMap = new Map()
        socialTradingBotsMap = new Map()
        candlesSignalsMap = new Map()
        saveOneFileCanRun = true
        web3 = new SA.nodeModules.web3()
        thisObject.availableStorage = NT.networkApp.p2pNetworkNode.node.availableStorage
        saveIntervalId = setInterval(saveMultipleFiles, 1000)
    }

    async function persistSocialGraph(filePath, fileName, fileContent) {

        return new Promise(saveGraphAsync)

        async function saveGraphAsync(resolve, reject) {

            if (thisObject.availableStorage === undefined) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Save Social Graph Because Available Storage is Undefined'
                }
                resolve(response)
                return
            }

            if (thisObject.availableStorage.storageContainerReferences.length === 0) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Save Post Because Storage Container References is Zero'
                }
                resolve(response)
                return
            }
                    // loop through array then access referenceParent.config
           
                    
            let web3 = new SA.nodeModules.web3()
            let password = SA.projects.foundations.utilities.encryption.randomPassword()
            let encryptedFileContent = SA.projects.foundations.utilities.encryption.encrypt(fileContent, password)
            console.log('this is what made it through to github storage', fileContent, password)
            let fileName = web3.eth.accounts.hashMessage(encryptedFileContent)

            /*
            We are going to save this file at all of the Storage Containers defined.
            */
            let savedCount = 0
            let notSavedCount = 0
            let fileKeys = []

            for (let i = 0; i < thisObject.availableStorage.storageContainerReferences.length; i++) {
                let storageContainerReference = thisObject.availableStorage.storageContainerReferences[i]
                if (storageContainerReference.referenceParent === undefined) {
                    continue
                }
                if (storageContainerReference.referenceParent.parentNode === undefined) {
                    continue
                }

                let storageContainer = storageContainerReference.referenceParent

                switch (storageContainer.type) {
                    case 'Github Storage Container': {
                        await SA.projects.openStorage.utilities.githubStorage.saveFile(fileName, filePath, encryptedFileContent, storageContainer)
                            .then(onFileSaved)
                            .catch(onFileNotSaved)
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
                    if (savedCount + notSavedCount === thisObject.availableStorage.storageContainerReferences.length) {
                        allFilesSaved()
                    }
                }

                function onFileNotSaved() {
                    notSavedCount++
                    if (savedCount + notSavedCount === thisObject.availableStorage.storageContainerReferences.length) {
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
                            message: 'Social Graph Saved'
                        }
                        resolve(response)
                    } else {
                        let response = {
                            result: 'Error',
                            message: 'Storage Provider Failed to Save at least 1 Event File'
                        }
                        resolve(response)
                    }
                }
            }
        }
    }

    async function loadSocialGraphFile(fileKeys) {
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

                if (file !== undefined) {
                    continue
                }

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

    async function saveMultipleFiles() {
        //candlesSignalsMap.forEach(saveOneFile)
    }

    async function saveOneFile(candlesSignalsToSave, socialTradingBotId) {

        if (candlesSignalsToSave.length === 0) { return }
        if (saveOneFileCanRun === false) { return }

        saveOneFileCanRun = false

        let socialTradingBot = socialTradingBotsMap.get(socialTradingBotId)
        /*
        Cleaning these maps before the next async operation.
        */
        candlesSignalsMap.delete(socialTradingBotId)
        socialTradingBotsMap.delete(socialTradingBotId)

        let timestamp = (new Date()).valueOf()
        let file = {
            timestamp: timestamp,
            content: candlesSignalsToSave
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
        for (let i = 0; i < thisObject.availableStorage.storageContainerReferences.length; i++) {
            let storageContainerReference = thisObject.availableStorage.storageContainerReferences[i]
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

                TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.outgoingCandleSignals.broadcastFileKey(fileKey, socialTradingBot)
            }

            function onFileNodeSaved() {
                /*
                The content then will be saved at the next run of this function.
                */
            }
        }

        saveOneFileCanRun = true
    }
}