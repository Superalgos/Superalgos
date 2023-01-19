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

            let timestamp = (new Date()).valueOf() 
            let repoFileName
            let repoFileContent
            let password
            if (fileName === "Data.Range.json") {
                // Save an unencrypted dataRange file
                repoFileName = fileName.slice(0, -5)
                repoFileContent = fileContent
                password = undefined
            } else {
                // Encrypt events 
                repoFileName = web3.eth.accounts.hashMessage(encryptedFileContent)
                let web3 = new SA.nodeModules.web3()
                password = SA.projects.foundations.utilities.encryption.randomPassword()
                repoFileContent = SA.projects.foundations.utilities.encryption.encrypt(fileContent, password)
            }
            let repoFilePath = filePath.slice(2);
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
                        await SA.projects.openStorage.utilities.githubStorage.saveFile(repoFileName, repoFilePath, repoFileContent, storageContainer)
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
                        fileName: repoFileName,
                        storageContainerId: storageContainer.id,
                        password: password
                    }
                    fileKeys.push(fileKey)
                    savedCount++
                    if (savedCount + notSavedCount === thisObject.availableStorage.storageContainerReferences.length) {
                        allFilesSaved()
                    }
                }

                function onFileNotSaved(err) {
                    SA.logger.error('Open Storage Network Client -> saveGraphAsync -> err.stack = ' + err.stack)
                    notSavedCount++
                    if (savedCount + notSavedCount === thisObject.availableStorage.storageContainerReferences.length) {
                        allFilesSaved()
                    }
                }

                function allFilesSaved() {
                    if (savedCount > 0) {
                
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
}